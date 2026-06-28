import jwt from 'jsonwebtoken';
import { User, IUser } from '../../models/user.model';
import { env } from '../../config';
import { AppError } from '../../middlewares';
import { LoginInput, RegisterInput, ChangePasswordInput } from './auth.validator';
import { UserRole } from '../../types/enums';

// ── Generate JWT ──
function generateToken(user: IUser): string {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      farm_id: user.farm_id.toString(),
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions,
  );
}

function generateRefreshToken(user: IUser): string {
  return jwt.sign(
    { userId: user._id.toString() },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions,
  );
}

// ── Login ──
export async function login(input: LoginInput) {
  const user = await User.findOne({ email: input.email }).select('+password');

  if (!user) {
    throw new AppError('Email atau password salah', 401);
  }

  if (!user.is_active) {
    throw new AppError('Akun tidak aktif', 403);
  }

  const isMatch = await user.comparePassword(input.password);
  if (!isMatch) {
    throw new AppError('Email atau password salah', 401);
  }

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      farm_id: user.farm_id,
    },
    token: generateToken(user),
    refreshToken: generateRefreshToken(user),
  };
}

// ── Register ──
export async function register(input: RegisterInput) {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new AppError('Email sudah terdaftar', 409);
  }

  const user = await User.create(input);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      farm_id: user.farm_id,
    },
    token: generateToken(user),
    refreshToken: generateRefreshToken(user),
  };
}

// ── Get Profile ──
export async function getProfile(userId: string) {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new AppError('User tidak ditemukan', 404);
  }
  return user;
}

// ── Change Password ──
export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError('User tidak ditemukan', 404);
  }

  const isMatch = await user.comparePassword(input.current_password);
  if (!isMatch) {
    throw new AppError('Password lama salah', 400);
  }

  user.password = input.new_password;
  await user.save();

  return { message: 'Password berhasil diubah' };
}

// ── Refresh Token ──
export async function refreshToken(token: string) {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user || !user.is_active) {
      throw new AppError('Token tidak valid', 401);
    }

    return {
      token: generateToken(user),
      refreshToken: generateRefreshToken(user),
    };
  } catch {
    throw new AppError('Refresh token tidak valid', 401);
  }
}

// ── Logout ──
export async function logout(userId: string) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User tidak ditemukan', 404);
  }
  // Client clears tokens locally; server acknowledges.
  // Future: add token blacklist/revocation store for true server-side invalidation.
  return { message: 'Berhasil logout' };
}

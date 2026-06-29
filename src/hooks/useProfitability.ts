// ─────────────────────────────────────────────────────────
// Profitability hooks — React Query
// ─────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfitability, getMarketPrices, setMarketPrice } from '@/services/profitability';

export function useProfitability() {
  return useQuery({
    queryKey: ['profitability'],
    queryFn: getProfitability,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMarketPrices() {
  return useQuery({
    queryKey: ['market-prices'],
    queryFn: getMarketPrices,
    staleTime: 10 * 60 * 1000,
  });
}

export function useSetMarketPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setMarketPrice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-prices'] });
      queryClient.invalidateQueries({ queryKey: ['profitability'] });
    },
  });
}

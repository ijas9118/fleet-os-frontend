import { StockTransactionType } from "@ahammedijas/fleet-os-shared";
import type { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { StockTransaction } from "@/types/stockTransaction";

import { getStockTransactionColumns } from "./StockTransactionColumns";

interface StockTransactionListPresenterProps {
  transactions: StockTransaction[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  pageCount: number;
  onPaginationChange: OnChangeFn<PaginationState>;
  transactionType: string;
  onTransactionTypeChange: (value: string) => void;
  onClearFilters: () => void;
}

export function StockTransactionListPresenter({
  transactions,
  loading,
  error,
  pagination,
  pageCount,
  onPaginationChange,
  transactionType,
  onTransactionTypeChange,
  onClearFilters,
}: StockTransactionListPresenterProps) {
  const navigate = useNavigate();

  const columns = useMemo(
    () =>
      getStockTransactionColumns({
        onViewDetails: (id) => navigate(`/tenant/stock-transactions/${id}`),
      }),
    [navigate],
  );

  const hasActiveFilters = !!transactionType;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Stock Transactions</h2>
          <p className="text-muted-foreground">Audit log of all stock movements and adjustments.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View detailed history of all inventory operations.</CardDescription>
        </CardHeader>
        <CardContent className="relative">
          {loading && (
            <div className="absolute inset-0 z-10 bg-background/50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {error && <div className="mb-4 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

          <DataTable
            columns={columns}
            data={transactions}
            pagination={pagination}
            pageCount={pageCount}
            onPaginationChange={onPaginationChange}
            searchElement={
              <div className="flex items-center gap-4 flex-1 flex-wrap">
                <Select value={transactionType || "all"} onValueChange={onTransactionTypeChange}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Filter by type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value={StockTransactionType.IN}>IN (Add)</SelectItem>
                    <SelectItem value={StockTransactionType.OUT}>OUT (Remove)</SelectItem>
                    <SelectItem value={StockTransactionType.ADJUSTMENT}>ADJUSTMENT</SelectItem>
                    <SelectItem value={StockTransactionType.TRANSFER_IN}>TRANSFER IN</SelectItem>
                    <SelectItem value={StockTransactionType.TRANSFER_OUT}>TRANSFER OUT</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <button
                    onClick={onClearFilters}
                    className="text-sm text-muted-foreground hover:text-foreground underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

import { StockTransactionType } from "@ahammedijas/fleet-os-shared";
import { useCallback, useEffect, useState } from "react";

import { inventoryService } from "@/services/inventoryService";
import type { StockTransaction } from "@/types/stockTransaction";

import { StockTransactionListPresenter } from "./components/StockTransactionListPresenter";

export default function StockTransactionList() {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [pageCount, setPageCount] = useState(0);
  const [transactionType, setTransactionType] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        type: transactionType ? (transactionType as StockTransactionType) : undefined,
      };

      const response = await inventoryService.listStockTransactions(params);
      const { data, meta } = response.data.result;

      setTransactions(data);
      setPageCount(meta.totalPages);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load transaction history";
      setError(errorMessage);
      console.error("Failed to fetch stock transactions:", err);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, transactionType]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleTransactionTypeChange = (value: string) => {
    setTransactionType(value === "all" ? "" : value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleClearFilters = () => {
    setTransactionType("");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <StockTransactionListPresenter
      transactions={transactions}
      loading={loading}
      error={error}
      pagination={pagination}
      pageCount={pageCount}
      onPaginationChange={setPagination}
      transactionType={transactionType}
      onTransactionTypeChange={handleTransactionTypeChange}
      onClearFilters={handleClearFilters}
    />
  );
}

"use client";
// src/hooks/useFoods.js
import { useState, useCallback } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export function useFoods() {
  const [foods, setFoods] = useState([]);
  const [stats, setStats] = useState({ total: 0, safe: 0, warning: 0, expired: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);

  const fetchFoods = useCallback(async ({ status = "", search = "", page = 1 } = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (search) params.set("search", search);
      params.set("page", page);
      params.set("limit", 12);

      const { data } = await api.get(`/api/foods?${params}`);
      setFoods(data.data);
      setPagination(data.pagination);
    } catch (err) {
      toast.error("Không thể tải danh sách thực phẩm");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get("/api/foods/stats");
      setStats(data.data);
    } catch {}
  }, []);

  const createFood = async (foodData) => {
    const { data } = await api.post("/api/foods", foodData);
    toast.success("Đã thêm thực phẩm!");
    return data.data;
  };

  const updateFood = async (id, foodData) => {
    const { data } = await api.put(`/api/foods/${id}`, foodData);
    toast.success("Đã cập nhật!");
    return data.data;
  };

  const deleteFood = async (id) => {
    await api.delete(`/api/foods/${id}`);
    toast.success("Đã xóa thực phẩm");
  };

  return { foods, stats, pagination, loading, fetchFoods, fetchStats, createFood, updateFood, deleteFood };
}

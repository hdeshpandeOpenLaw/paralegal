'use client';

import { useState, useEffect } from 'react';
import {
  getMatters,
  getMatterDetails,
  getMattersTotalCount,
  getPendingMattersCount,
  getBillsAwaitingPaymentCount,
  getOutstandingClientBalancesCount,
  getTasks,
  getTaskDetails,
  getTasksTotalCount,
  getAllTasks,
} from '../clio-api';

export const useClioData = (isClioConnected: boolean) => {
  const [clioMatters, setClioMatters] = useState<any[]>([]);
  const [loadingClio, setLoadingClio] = useState(false);
  const [clioError, setClioError] = useState<string | null>(null);
  const [pendingMattersCount, setPendingMattersCount] = useState(0);
  const [billsAwaitingPaymentCount, setBillsAwaitingPaymentCount] = useState(0);
  const [clientsDueForFollowupCount, setClientsDueForFollowupCount] = useState(0);
  const [outstandingBalancesCount, setOutstandingBalancesCount] = useState(0);
  const [tasks, setTasks] = useState<any[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [selectedMatter, setSelectedMatter] = useState<any>(null);
  const [isMatterModalOpen, setIsMatterModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [mattersCurrentPage, setMattersCurrentPage] = useState(1);
  const mattersPerPage = 15;
  const [totalMattersCount, setTotalMattersCount] = useState(0);
  const [tasksCurrentPage, setTasksCurrentPage] = useState(1);
  const [totalTasksCount, setTotalTasksCount] = useState(0);
  const tasksPerPage = 6;

  useEffect(() => {
    if (isClioConnected) {
      const token = localStorage.getItem('clio_access_token');
      if (token) {
        fetchClioMatters(token, mattersCurrentPage);
        fetchMattersTotalCount(token);
        fetchPendingMattersCount(token);
        fetchBillsAwaitingPaymentCount(token);
        fetchClientsDueForFollowup(token);
        fetchTasks(token, tasksCurrentPage);
        fetchAllTasks(token);
        fetchTasksTotalCount(token);
      } else {
        setClioError("Clio access token not found in local storage.");
      }
    }
  }, [isClioConnected, mattersCurrentPage, tasksCurrentPage]);

  const fetchClioMatters = async (token: string, page: number = 1) => {
    setLoadingClio(true);
    setClioError(null);
    const offset = (page - 1) * mattersPerPage;
    try {
      const matters = await getMatters(token, mattersPerPage, offset);
      if (matters && Array.isArray(matters.data)) {
        setClioMatters(matters.data);
      } else {
        console.warn('Received unexpected format for Clio matters:', matters);
        setClioMatters([]);
        setClioError('Could not retrieve matters from Clio. The data format was unexpected.');
      }
    } catch (error: any) {
      setClioError(error.message);
    } finally {
      setLoadingClio(false);
    }
  };

  const fetchMattersTotalCount = async (token: string) => {
    try {
      const count = await getMattersTotalCount(token);
      if (typeof count === 'number') {
        setTotalMattersCount(count);
      } else {
        console.warn('Received unexpected format for matters total count:', count);
      }
    } catch (error: any) {
      console.error('Could not retrieve matters total count from Clio:', error.message);
    }
  };

  const fetchPendingMattersCount = async (token: string) => {
    try {
      const count = await getPendingMattersCount(token);
      if (typeof count === 'number') {
        setPendingMattersCount(count);
      } else {
        console.warn('Received unexpected format for pending matters count:', count);
      }
    } catch (error: any) {
      console.error('Could not retrieve pending matters count from Clio:', error.message);
    }
  };

  const fetchBillsAwaitingPaymentCount = async (token: string) => {
    try {
      const count = await getBillsAwaitingPaymentCount(token);
      if (typeof count === 'number') {
        setBillsAwaitingPaymentCount(count);
      } else {
        console.warn('Received unexpected format for bills awaiting payment count:', count);
      }
    } catch (error: any) {
      console.error('Could not retrieve bills awaiting payment count from Clio:', error.message);
    }
  };

  const fetchClientsDueForFollowup = async (token: string) => {
    try {
      const matters = await getMatters(token, 100, 0);
      if (matters && Array.isArray(matters.data)) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dueMatters = matters.data.filter((matter: any) => {
          if (!matter.last_activity_date) return true;
          return new Date(matter.last_activity_date) < thirtyDaysAgo;
        });
        setClientsDueForFollowupCount(dueMatters.length);
      }
    } catch (error: any) {
      console.error('Could not retrieve clients due for followup:', error.message);
    }
  };

  const fetchTasks = async (token: string, page: number = 1) => {
    const offset = (page - 1) * tasksPerPage;
    try {
      const result = await getTasks(token, tasksPerPage, offset);
      if (result && Array.isArray(result.data)) {
        setTasks(result.data);
      } else {
        console.warn('Received unexpected format for tasks:', result);
      }
    } catch (error: any) {
      console.error('Could not retrieve tasks from Clio:', error.message);
    }
  };

  const fetchAllTasks = async (token: string) => {
    try {
      const result = await getAllTasks(token);
      if (result && Array.isArray(result.data)) {
        setAllTasks(result.data);
      } else {
        console.warn('Received unexpected format for all tasks:', result);
      }
    } catch (error: any) {
      console.error('Could not retrieve all tasks from Clio:', error.message);
    }
  };

  const fetchTasksTotalCount = async (token: string) => {
    try {
      const count = await getTasksTotalCount(token);
      if (typeof count === 'number') {
        setTotalTasksCount(count);
      } else {
        console.warn('Received unexpected format for tasks total count:', count);
      }
    } catch (error: any) {
      console.error('Could not retrieve tasks total count from Clio:', error.message);
    }
  };

  const handleTaskClick = async (taskId: string) => {
    const token = localStorage.getItem('clio_access_token');
    if (token) {
      try {
        const taskDetails = await getTaskDetails(token, taskId);
        setSelectedTask(taskDetails.data);
        setIsTaskModalOpen(true);
      } catch (error: any) {
        setClioError(`Error fetching task details: ${error.message}`);
      }
    }
  };

  const handleMatterClick = async (matterId: string) => {
    const token = localStorage.getItem('clio_access_token');
    if (token) {
      try {
        const matterDetails = await getMatterDetails(token, matterId);
        setSelectedMatter(matterDetails.data);
        setIsMatterModalOpen(true);
      } catch (error: any) {
        setClioError(`Error fetching matter details: ${error.message}`);
      }
    }
  };

  return {
    clioMatters,
    loadingClio,
    clioError,
    pendingMattersCount,
    billsAwaitingPaymentCount,
    clientsDueForFollowupCount,
    outstandingBalancesCount,
    tasks,
    allTasks,
    selectedMatter,
    isMatterModalOpen,
    selectedTask,
    isTaskModalOpen,
    mattersCurrentPage,
    totalMattersCount,
    tasksCurrentPage,
    totalTasksCount,
    handleTaskClick,
    handleMatterClick,
    setIsMatterModalOpen,
    setIsTaskModalOpen,
    setMattersCurrentPage,
    setTasksCurrentPage,
    mattersPerPage,
    tasksPerPage,
  };
};

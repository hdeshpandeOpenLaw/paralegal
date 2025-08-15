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
  getTaskTypes,
  getUntouchedCasesCount,
  getInactiveMattersCount,
  getInactiveClientsCount,
  getDocketsToReviewCount,
  getOutstandingTasksCount,
  getPastDueTasksCount,
  getNegativeBalanceCasesCount,
  getReplenishmentNeededCount,
  getCurrentUser,
} from '../clio-api';

export const useClioData = (isClioConnected: boolean, matterFilter: string = 'All', sortOption: string = 'id(asc)', taskFilter: string = 'All', taskSortOption: string = 'due_at(asc)', taskPriorityFilter: string = 'All', taskTypeFilter: string = '') => {
  const [clioMatters, setClioMatters] = useState<any[]>([]);
  const [loadingClio, setLoadingClio] = useState(false);
  const [clioError, setClioError] = useState<string | null>(null);
  const [pendingMattersCount, setPendingMattersCount] = useState(0);
  const [billsAwaitingPaymentCount, setBillsAwaitingPaymentCount] = useState(0);
  const [clientsDueForFollowupCount, setClientsDueForFollowupCount] = useState(0);
  const [outstandingBalancesCount, setOutstandingBalancesCount] = useState(0);
  const [untouchedCasesCount, setUntouchedCasesCount] = useState(0);
  const [inactiveMattersCount, setInactiveMattersCount] = useState(0);
  const [inactiveClientsCount, setInactiveClientsCount] = useState(0);
  const [docketsToReviewCount, setDocketsToReviewCount] = useState(0);
  const [outstandingTasksCount, setOutstandingTasksCount] = useState(0);
  const [pastDueTasksCount, setPastDueTasksCount] = useState(0);
  const [negativeBalanceCasesCount, setNegativeBalanceCasesCount] = useState(0);
  const [replenishmentNeededCount, setReplenishmentNeededCount] = useState(0);
  const [clioUserId, setClioUserId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [taskTypes, setTaskTypes] = useState<any[]>([]);
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
        fetchClioMatters(token, mattersCurrentPage, matterFilter, sortOption);
        fetchMattersTotalCount(token, matterFilter);
        fetchPendingMattersCount(token);
        fetchBillsAwaitingPaymentCount(token);
        fetchClientsDueForFollowup(token);
        fetchUntouchedCasesCount(token);
        fetchInactiveMattersCount(token);
        fetchInactiveClientsCount(token);
        fetchDocketsToReviewCount(token);
        fetchOutstandingTasksCount(token);
        fetchPastDueTasksCount(token);
        fetchNegativeBalanceCasesCount(token);
        fetchReplenishmentNeededCount(token);
        fetchClioCurrentUser(token);
        fetchTasks(token, tasksCurrentPage, taskFilter, taskSortOption, taskPriorityFilter, taskTypeFilter);
        fetchAllTasks(token);
        fetchTasksTotalCount(token, taskFilter);
        fetchTaskTypes(token);
      } else {
        setClioError("Clio access token not found in local storage.");
      }
    }
  }, [isClioConnected, mattersCurrentPage, tasksCurrentPage, matterFilter, sortOption, taskFilter, taskSortOption, taskPriorityFilter, taskTypeFilter]);

  const fetchTaskTypes = async (token: string) => {
    try {
      const result = await getTaskTypes(token);
      if (result && Array.isArray(result.data)) {
        setTaskTypes(result.data);
      } else {
        console.warn('Received unexpected format for task types:', result);
        setClioError('Could not retrieve task categories: The data format was unexpected.');
      }
    } catch (error: any) {
      console.error('Could not retrieve task types from Clio:', error.message);
      setClioError(`Could not retrieve task categories: ${error.message}`);
    }
  };

  const fetchClioMatters = async (token: string, page: number = 1, filter: string = 'All', sort: string = 'id(asc)') => {
    setLoadingClio(true);
    setClioError(null);
    const offset = (page - 1) * mattersPerPage;
    try {
      const matters = await getMatters(token, mattersPerPage, offset, filter, sort);
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

  const fetchMattersTotalCount = async (token: string, filter: string = 'All') => {
    try {
      const count = await getMattersTotalCount(token, filter);
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

  const fetchUntouchedCasesCount = async (token: string) => {
    try {
      const count = await getUntouchedCasesCount(token);
      if (typeof count === 'number') {
        setUntouchedCasesCount(count);
      } else {
        console.warn('Received unexpected format for untouched cases count:', count);
      }
    } catch (error: any) {
      console.error('Could not retrieve untouched cases count from Clio:', error.message);
    }
  };

  const fetchInactiveMattersCount = async (token: string) => {
    try {
      const count = await getInactiveMattersCount(token);
      if (typeof count === 'number') {
        setInactiveMattersCount(count);
      } else {
        console.warn('Received unexpected format for inactive matters count:', count);
      }
    } catch (error: any) {
      console.error('Could not retrieve inactive matters count from Clio:', error.message);
    }
  };

  const fetchInactiveClientsCount = async (token: string) => {
    try {
      const count = await getInactiveClientsCount(token);
      if (typeof count === 'number') {
        setInactiveClientsCount(count);
      } else {
        console.warn('Received unexpected format for inactive clients count:', count);
      }
    } catch (error: any) {
      console.error('Could not retrieve inactive clients count from Clio:', error.message);
    }
  };

  const fetchDocketsToReviewCount = async (token: string) => {
    try {
      const count = await getDocketsToReviewCount(token);
      if (typeof count === 'number') {
        setDocketsToReviewCount(count);
      } else {
        console.warn('Received unexpected format for dockets to review count:', count);
      }
    } catch (error: any) {
      console.error('Could not retrieve dockets to review count from Clio:', error.message);
    }
  };

  const fetchOutstandingTasksCount = async (token: string) => {
    try {
      const count = await getOutstandingTasksCount(token);
      if (typeof count === 'number') {
        setOutstandingTasksCount(count);
      } else {
        console.warn('Received unexpected format for outstanding tasks count:', count);
      }
    } catch (error: any) {
      console.error('Could not retrieve outstanding tasks count from Clio:', error.message);
    }
  };

  const fetchPastDueTasksCount = async (token: string) => {
    try {
      const count = await getPastDueTasksCount(token);
      if (typeof count === 'number') {
        setPastDueTasksCount(count);
      } else {
        console.warn('Received unexpected format for past due tasks count:', count);
      }
    } catch (error: any) {
      console.error('Could not retrieve past due tasks count from Clio:', error.message);
    }
  };

  const fetchNegativeBalanceCasesCount = async (token: string) => {
    try {
      const count = await getNegativeBalanceCasesCount(token);
      if (typeof count === 'number') {
        setNegativeBalanceCasesCount(count);
      } else {
        console.warn('Received unexpected format for negative balance cases count:', count);
      }
    } catch (error: any) {
      console.error('Could not retrieve negative balance cases count from Clio:', error.message);
    }
  };

  const fetchReplenishmentNeededCount = async (token: string) => {
    try {
      const count = await getReplenishmentNeededCount(token);
      if (typeof count === 'number') {
        setReplenishmentNeededCount(count);
      } else {
        console.warn('Received unexpected format for replenishment needed count:', count);
      }
    } catch (error: any) {
      console.error('Could not retrieve replenishment needed count from Clio:', error.message);
    }
  };

  const fetchClioCurrentUser = async (token: string) => {
    try {
      const user = await getCurrentUser(token);
      if (user?.data?.id) {
        setClioUserId(user.data.id);
      } else {
        console.warn('Could not retrieve Clio user ID.');
      }
    } catch (error: any) {
      console.error('Could not retrieve Clio user from Clio:', error.message);
    }
  };

  const fetchTasks = async (token: string, page: number, status: string, order: string, priority: string, taskTypeId: string) => {
    const offset = (page - 1) * tasksPerPage;
    try {
      const result = await getTasks(token, tasksPerPage, offset, status, order, taskTypeId);
      if (result && Array.isArray(result.data)) {
        let filteredTasks = result.data;
        if (priority !== 'All') {
          filteredTasks = result.data.filter((task: any) => task.priority.toLowerCase() === priority.toLowerCase());
        }
        setTasks(filteredTasks);
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

  const fetchTasksTotalCount = async (token: string, status: string) => {
    try {
      const count = await getTasksTotalCount(token, status);
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
    untouchedCasesCount,
    inactiveMattersCount,
    inactiveClientsCount,
    docketsToReviewCount,
    outstandingTasksCount,
    pastDueTasksCount,
    negativeBalanceCasesCount,
    replenishmentNeededCount,
    clioUserId,
    tasks,
    allTasks,
    taskTypes,
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

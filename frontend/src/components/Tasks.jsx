import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import Loader from './utils/Loader';
import Tooltip from './utils/Tooltip';

const Tasks = () => {

  const authState = useSelector(state => state.authReducer);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all"); // New state to manage filter
  const [fetchData, { loading }] = useFetch();

  const fetchTasks = useCallback(() => {
    let url = "/tasks";
    
    // Modify URL based on filter state
    if (filter === "completed") {
      url += "?completed=true";
    } else if (filter === "incomplete") {
      url += "?completed=false";
    }

    const config = { url, method: "get", headers: { Authorization: authState.token } };
    fetchData(config, { showSuccessToast: false }).then(data => setTasks(data.tasks));
  }, [authState.token, fetchData, filter]);

  useEffect(() => {
    if (!authState.isLoggedIn) return;
    fetchTasks();
  }, [authState.isLoggedIn, fetchTasks]);

  const handleDelete = (id) => {
    const config = { url: `/tasks/${id}`, method: "delete", headers: { Authorization: authState.token } };
    fetchData(config).then(() => fetchTasks());
  }

  const handleComplete = (id, completed) => {
    const config = {
      url: `/tasks/${id}`,
      method: "patch",
      headers: { Authorization: authState.token },
      data: { completed: !completed }
    };
    fetchData(config).then(() => fetchTasks());
  }

  return (
    <>
      <div className="my-2 mx-auto max-w-[700px] py-4">

        <div className="flex justify-between items-center mb-4">
          <h2 className='my-2 ml-2 md:ml-0 text-xl'>
            Your tasks ({tasks.length})
          </h2>

          {/* Filter Dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white border rounded-md px-2 py-1 text-gray-600"
          >
            <option value="all">All Tasks</option>
            <option value="completed">Completed</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div>
            {tasks.length === 0 ? (
              <div className='w-[600px] h-[300px] flex items-center justify-center gap-4'>
                <span>No tasks found</span>
                <Link to="/tasks/add" className="bg-blue-500 text-white hover:bg-blue-600 font-medium rounded-md px-4 py-2">+ Add new task </Link>
              </div>
            ) : (
              tasks.map((task, index) => (
                <div key={task._id} className={`bg-white my-4 p-4 text-gray-600 rounded-md shadow-md ${task.completed ? 'bg-gray-100 line-through' : ''}`}>
                  <div className='flex items-center'>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleComplete(task._id, task.completed)}
                      className="mr-2"
                    />
                    <span className='font-medium'>Task #{index + 1}</span>

                    <Tooltip text={"Edit this task"} position={"top"}>
                      <Link to={`/tasks/${task._id}`} className='ml-auto mr-2 text-green-600 cursor-pointer'>
                        <i className="fa-solid fa-pen"></i>
                      </Link>
                    </Tooltip>

                    <Tooltip text={"Delete this task"} position={"top"}>
                      <span className='text-red-500 cursor-pointer' onClick={() => handleDelete(task._id)}>
                        <i className="fa-solid fa-trash"></i>
                      </span>
                    </Tooltip>
                  </div>
                  <div className='whitespace-pre'>{task.description}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default Tasks;

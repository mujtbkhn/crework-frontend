import React, { useEffect, useState } from "react";
import Modal from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import TodoComp from "../../components/TodoComp/TodoComp";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Board.css";
import {
  getUserFromToken,
} from "../../apis/auth";
import {
  getCreateTodo,
  getTodos,
  moveTask,
} from "../../apis/todo";
import { format } from "date-fns";

const Board = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [currentSection, setCurrentSection] = useState('To do');
  const [userDetails, setUserDetails] = useState("");
  const [todos, setTodos] = useState([]);
  const [isNewTaskFromSidebar, setIsNewTaskFromSidebar] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("week");
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const user = await getUserFromToken();
      setUserDetails(user);
      fetchTodos(selectedFilter);
    };
    fetchUserDetails();

    const onStorageChange = () => {
      fetchUserDetails();
    };

    window.addEventListener("storage", onStorageChange);

    return () => {
      window.removeEventListener("storage", onStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleCreateNewTask = () => {
      onOpenModalFromSidebar();
    };

    window.addEventListener('createNewTask', handleCreateNewTask);

    return () => {
      window.removeEventListener('createNewTask', handleCreateNewTask);
    };
  }, []);

  useEffect(() => {
    fetchTodos(selectedFilter);
  }, [selectedFilter]);

  useEffect(() => { }, [userDetails]);


  const fetchTodos = async (filter) => {
    setIsLoading(true);
    try {
      const data = await getTodos(filter);
      setTodos(data);
      console.log("Fetched todos:", data); // Add this line
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setSelectedFilter(e.target.value);
  };

  const onOpenModal = (section) => {
    setCurrentSection(section);
    setIsNewTaskFromSidebar(false);
    setOpen(true);
  };

  const onOpenModalFromSidebar = () => {
    setCurrentSection("To do");
    setIsNewTaskFromSidebar(true);
    setOpen(true);
  };

  const onCloseModal = () => {
    setOpen(false);
    resetFormFields();
  };

  const resetFormFields = () => {
    setTitle("");
    setDescription("");
    setSelectedPriority("");
    setDueDate(null);
  };

  const handlePriorityClick = (priority) => {
    setSelectedPriority(priority);
  };

  const validateForm = () => {
    const errors = {};
    if (!title.trim()) {
      errors.title = "Title is required";
    }
    if (!description.trim()) {
      errors.title = "Title is required";
    }
    if (!selectedPriority) {
      errors.priority = "Priority must be selected";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveTodo = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      const formattedDueDate = dueDate;
      console.log(formattedDueDate);

      const todoData = {
        title,
        description,
        priority: selectedPriority,
        section: currentSection,
        dueDate: formattedDueDate,
      };

      await getCreateTodo(todoData);

      onCloseModal();
      fetchTodos('week');
    } catch (error) {
      console.error("Error creating todo:", error);
    }
  };

  const handleMoveTask = async (todoId, section) => {
    try {
      await moveTask(todoId, section);
      fetchTodos();
    } catch (error) {
      console.error("Error moving task:", error);
    }
  };

  return (
    <div className="board__container">
      <div className="board__top">
        <div className="top__heading">
          <h2>Good Morning, {userDetails?.name?.split(' ')[0]}!</h2>
          <div>
            <select
              value={selectedFilter}
              onChange={(e) => handleFilterChange(e)}
              name=""
              id=""
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
        <div className="top__heading">
          
        </div>
        <div className="board__main">
          <TodoComp
            name="To do"
            todos={todos.filter((todo) => todo.section === "To do")}
            onMoveTask={handleMoveTask}
            fetchTodos={fetchTodos}
            isLoading={isLoading}
            dueDate={dueDate}
            onPlusClick={() => onOpenModal("To do")}
          />
          <TodoComp
            name="In Progress"
            todos={todos.filter((todo) => todo.section === "In Progress")}
            onMoveTask={handleMoveTask}
            fetchTodos={fetchTodos}
            isLoading={isLoading}
            dueDate={dueDate}
            onPlusClick={() => onOpenModal("In Progress")}
          />
          <TodoComp
            name="Under Review"
            todos={todos.filter((todo) => todo.section === "Under Review")}
            onMoveTask={handleMoveTask}
            fetchTodos={fetchTodos}
            isLoading={isLoading}
            dueDate={dueDate}
            onPlusClick={() => onOpenModal("Under Review")}
          />
          <TodoComp
            name="Finished"
            todos={todos.filter((todo) => todo.section === "Finished")}
            onMoveTask={handleMoveTask}
            fetchTodos={fetchTodos}
            isLoading={isLoading}
            dueDate={dueDate}
            onPlusClick={() => onOpenModal("Finished")}
          />
        </div>
        <Modal
          open={open}
          onClose={onCloseModal}
          center
          showCloseIcon={false}
          classNames={{ modal: "custom-modal" }}
        >
          <div className="modal__content">
            <div className="modal__section">
              <h3>
                Title <span style={{ color: "red" }}>*</span>
              </h3>
              <input
                type="text"
                placeholder="Enter Task Title"
                className="modal__input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {formErrors.title && <p className="error">{formErrors.title}</p>}
            </div>
            <div className="modal__section">
              <h3>
                Description <span style={{ color: "red" }}>*</span>
              </h3>
              <input
                type="text"
                placeholder="Enter Task Description"
                className="modal__input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {formErrors.description && <p className="error">{formErrors.description}</p>}
            </div>
            {isNewTaskFromSidebar && (
              <div className="modal__section">
                <h3>Section</h3>
                <select
                  value={currentSection}
                  onChange={(e) => setCurrentSection(e.target.value)}
                  className="modal__input"
                >
                  <option value="To do">To do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Finished">Finished</option>
                </select>
              </div>
            )}
            <div className="modal__section">
              <div className="priority__buttons">
                <h3>
                  Select Priority<span style={{ color: "red" }}>*</span>
                </h3>
                <div
                  className={`priority__button ${selectedPriority === "Urgent" ? "selected" : ""
                    }`}
                  onClick={() => handlePriorityClick("Urgent")}
                >
                  <span className="priority__dot high" /> Urgent Priority
                </div>
                <div
                  className={`priority__button ${selectedPriority === "Medium" ? "selected" : ""
                    }`}
                  onClick={() => handlePriorityClick("Medium")}
                >
                  <span className="priority__dot moderate" /> Medium Priority
                </div>
                <div
                  className={`priority__button ${selectedPriority === "LOW" ? "selected" : ""
                    }`}
                  onClick={() => handlePriorityClick("LOW")}
                >
                  <span className="priority__dot low" /> Low Priority
                </div>
              </div>
              {formErrors.priority && (
                <p className="error">{formErrors.priority}</p>
              )}
            </div>

            <div className="modal__section modal__buttons">
              <DatePicker
                selected={dueDate}
                onChange={(date) => {
                  setDueDate(date);
                }}
                placeholderText="Select Due Date"
                className="due__date"
                dateFormat="dd/MM/yyyy"
              />
              <div className="modal__actions__button">
                <button
                  className="modal__action__button cancel"
                  onClick={onCloseModal}
                >
                  Cancel
                </button>
                <button
                  className="modal__action__button save"
                  onClick={handleSaveTodo}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Board;

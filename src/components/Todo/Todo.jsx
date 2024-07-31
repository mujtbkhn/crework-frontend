import React, { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import Modal from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import "./Todo.css";
import { deleteTodoById, getTodoById, updateTodo } from "../../apis/todo";
import toast from "react-hot-toast";
import { Tooltip } from "react-tooltip";
import ShimmerUI from "../ShimmerUI/ShimmerUI";

const Todo = ({
  todo,
  sectionName,
  onMoveTask,
  fetchTodos,
  isLoading,
}) => {
  const [show, setShow] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editedTodo, setEditedTodo] = useState({
    title: todo.title || "",
    priority: todo.priority || "",
    description: todo.description || "",
    dueDate: todo.dueDate || null,
    section: todo.section || "",
  });

  useEffect(() => {
    if (editModalOpen && todo._id) {
      fetchTodoDetails(todo._id);
    }
  }, [editModalOpen, todo._id]);

  const fetchTodoDetails = async (todoId) => {
    try {
      const response = await getTodoById(todoId);
      const fetchedTodo = response.todo;
      setEditedTodo({
        title: fetchedTodo.title || "",
        priority: fetchedTodo.priority || "",
        description: fetchedTodo.description || "",
        dueDate: fetchedTodo.dueDate
          ? format(parseISO(fetchedTodo.dueDate), "yyyy-MM-dd")
          : "",
        section: fetchedTodo.section || "",
      });
    } catch (error) {
      console.error("Error fetching todo:", error);
    }
  };

  const openEditModal = () => {
    setEditModalOpen(true);
    setShow(false);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
  };

  const handleUpdateTodo = async () => {
    try {
      await updateTodo(todo._id, editedTodo);
      closeEditModal();
      fetchTodos();
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = parseISO(dateString);
    return format(date, "MMM do");
  };

  const isDueDatePast = (dateString) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    return dueDate < today;
  };

  const handleMoveButtonClick = (section) => {
    onMoveTask(todo._id, section);
  };

  const openDeleteModal = () => {
    setDeleteModalOpen(true);
    setShow(false);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const handleDeleteTodo = async () => {
    try {
      await deleteTodoById(todo._id);
      closeDeleteModal();
      fetchTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const handleView = async () => {
    try {
      const storyURL = `${window.location.origin}/view/${todo._id}`;
      await navigator.clipboard.writeText(storyURL);
      toast.success("Link Copied", {
        style: {
          position: "relative",
          top: "4rem",
          color: "black",
          backgroundColor: "#F6FFF9",
          border: " 1px solid #4DC3B7",
          fontSize: "1.5rem",
        },
      });
      setShow(false);
    } catch (error) {
      console.error(error);
    }
  };

  const buttons = [
    { value: "Under Review", label: "UNDER REVIEW" },
    { value: "In Progress", label: "PROGRESS" },
    { value: "To do", label: "TO-DO" },
    { value: "Finished", label: "FINISHED" },
  ];

  const trimmedTitle =
    todo.title.length >= 20 ? todo.title.slice(0, 20) + "..." : todo.title;

  const getPriorityStyle = (priority) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return { backgroundColor: "red", borderRadius: "5px", color: "white" };
      case "medium":
        return { backgroundColor: "yellow", borderRadius: "5px", color: "black" };
      case "low":
        return { backgroundColor: "green", borderRadius: "5px", color: "white" };
      default:
        return {};
    }
  };
  return (
    <div className="todo_main">
      {isLoading ? (
        <ShimmerUI />
      ) : (
        <>
          <div className="todo_priority common">

            <div className="todo_heading">
              <a className={`my-anchor-element-${todo._id}`}>
                <h2>{trimmedTitle}</h2>
              </a>
              <Tooltip
                anchorSelect={`.my-anchor-element-${todo._id}`}
                place="top"
              >
                {todo.title}
              </Tooltip>
            </div>
            <img
              width="20"
              height="20"
              src="https://img.icons8.com/ios-glyphs/60/ellipsis.png"
              alt="ellipsis"
              style={{ cursor: "pointer" }}
              onClick={() => setShow((prev) => !prev)}
            />
            {show && (
              <div className="show">
                <p onClick={openEditModal}>Edit</p>
                <p onClick={handleView}>Share</p>
                <p style={{ color: "red" }} onClick={openDeleteModal}>
                  Delete
                </p>
              </div>
            )}
          </div>

          <div className="todo_heading">
            <p>{todo.description}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
            <p style={{ fontSize: ".8rem", display: "flex", justifyContent: "center", width: "100px", ...getPriorityStyle(todo.priority) }}>
              {todo.priority.toUpperCase()}
            </p>
          </div>
          <div className="todo_button common">
            {/* <div>
              {todo.dueDate ? (
                <button
                  style={{
                    backgroundColor:
                      sectionName === "Finished"
                        ? "#55B054"
                        : isDueDatePast(todo.dueDate)
                          ? "red"
                          : "#F0F0F0",
                    color:
                      sectionName === "Finished"
                        ? "white"
                        : isDueDatePast(todo.dueDate)
                          ? "white"
                          : "initial",
                  }}
                >
                  {formatDate(todo?.dueDate)}
                </button>
              ) : (
                ""
              )}
            </div> */}

            <div style={{ display: "flex" }}>
              {buttons
                .filter((button) => button.value !== sectionName)
                .map((button) => (
                  <button
                    className="pointer custom_button"
                    key={button.value}
                    value={button.value}
                    onClick={() => handleMoveButtonClick(button.value)}
                  >
                    {button.label}
                  </button>
                ))}
            </div>
          </div>
          <Modal
            open={editModalOpen}
            onClose={closeEditModal}
            center
            classNames={{ modal: "custom-modal" }}
          >
            <div className="modal__content">
              <h2>Edit Todo</h2>
              <div className="modal__section">
                <h3>Title</h3>
                <input
                  type="text"
                  value={editedTodo.title}
                  onChange={(e) =>
                    setEditedTodo({ ...editedTodo, title: e.target.value })
                  }
                  placeholder="Enter Task Title"
                  className="modal__input"
                />
              </div>
              <div className="modal__section">
                <h3>Select Priority</h3>
                <div className="priority__buttons">
                  <div
                    className={`priority__button ${editedTodo.priority === "Urgent" ? "selected" : ""
                      }`}
                    onClick={() =>
                      setEditedTodo({ ...editedTodo, priority: "Urgent" })
                    }
                  >
                    <span className="priority__dot high" /> Urgent Priority
                  </div>
                  <div
                    className={`priority__button ${editedTodo.priority === "Medium" ? "selected" : ""
                      }`}
                    onClick={() =>
                      setEditedTodo({ ...editedTodo, priority: "Medium" })
                    }
                  >
                    <span className="priority__dot moderate" /> Medium Priority
                  </div>
                  <div
                    className={`priority__button ${editedTodo.priority === "Low" ? "selected" : ""
                      }`}
                    onClick={() =>
                      setEditedTodo({ ...editedTodo, priority: "Low" })
                    }
                  >
                    <span className="priority__dot low" /> Low Priority
                  </div>
                </div>
              </div>

              <div className="modal__section">
                <h3>Due Date</h3>
                <input
                  type="date"
                  value={editedTodo.dueDate}
                  onChange={(e) => {
                    setEditedTodo({ ...editedTodo, dueDate: e.target.value });
                  }}
                  className="modal__input"
                />
              </div>
              <div className="modal__actions">
                <button className="modal__button save" onClick={closeEditModal}>
                  <span> Cancel</span>
                </button>
                <button
                  className="modal__button cancel"
                  onClick={handleUpdateTodo}
                >
                  <span>Save</span>
                </button>
              </div>
            </div>
          </Modal>
          <Modal
            open={deleteModalOpen}
            onClose={closeDeleteModal}
            center
            classNames={{ modal: "custom-modal" }}
          >
            <div className="modal__content">
              <h3>Are you sure you want to delete this todo?</h3>
              <div className="modal__actions">
                <button
                  className="modal__button save"
                  onClick={handleDeleteTodo}
                >
                  <span> Delete</span>
                </button>
                <button
                  className="modal__button cancel"
                  onClick={closeDeleteModal}
                >
                  <span> Cancel</span>
                </button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default Todo;
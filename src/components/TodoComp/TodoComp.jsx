import React from "react";
import "./TodoComp.css";
import PLUS from "../../images/plus_.png";
import Todo from "../Todo/Todo";

const TodoComp = ({
  name,
  onPlusClick,
  todos,
  onMoveTask,
  fetchTodos,
  isLoading
}) => {
  return (
    <div className="todo__main">
      <div className="todo__top">
        <div>
          <h3>{name}</h3>
        </div>
      </div>
      <div className="todo__items">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          todos?.map((todo) => (
            <div key={todo._id} className="todo__item">
              <Todo
                todo={todo}
                sectionName={name}
                onMoveTask={onMoveTask}
                fetchTodos={fetchTodos}
              />
            </div>
          ))
        )}
         <div className="plus" onClick={() => onPlusClick(name)}>
          <button className="plus-button">
            Add New
            <img src={PLUS} alt="Add new todo" className="plus-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoComp;
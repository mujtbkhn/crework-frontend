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
  isLoading,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  return (
    <div 
      className="todo__main"
      onDragOver={(e) => onDragOver(e)}
      onDrop={(e) => onDrop(e, name)}
    >
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
            <div 
              key={todo._id} 
              className="todo__item"
              draggable
              onDragStart={(e) => onDragStart(e, todo._id, name)}
            >
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
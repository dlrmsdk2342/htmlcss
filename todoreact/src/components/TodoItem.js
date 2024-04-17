/*
  각각의 할 일 항목을 렌더링하는 컴포넌트입니다.
  각 할 일의 완료 상태에 따라 체크박스와 텍스트 스타일을 동기화하며,
  삭제 버튼을 통해 해당 할 일을 삭제할 수 있습니다.
  이 컴포넌트는 `TodoList.js`에서 사용되어 할 일 목록을 구성합니다.
*/
import React, {useState} from "react";
import styles from "@/styles/TodoList.module.css";

const TodoItem = ({ todo, onToggle, onDelete, onEdit }) => {
  // 수정 모드인지 여부를 관리하는 상태를 정의합니다.
  const [isEditing, setIsEditing] = useState(false);
  // 수정할 내용을 저장하는 상태를 정의합니다.
  const [editText, setEditText] = useState(todo.text);

  // 수정 모드를 활성화하는 함수를 정의합니다.
  const activateEditMode = () => {
    setIsEditing(true);
  };

  // 수정 모드를 비활성화하고 변경된 내용을 저장하는 함수를 정의합니다.
  const handleSave = () => {
    onEdit(editText);
    setIsEditing(false);
  };

  // 할 일 항목을 렌더링합니다.
  return (
    <li className="bg-green-200 flex items-center justify-between py-2 px-4 border-b border-gray-200 shadow-md mb-1">
      {/* 체크박스를 렌더링하고, 체크박스의 상태를 할 일의 완료 상태와 동기화합니다. */}
      <input
        className="mr-4"
        type="checkbox"
        checked={todo.completed}
        onChange={onToggle}
      />
      
      {/* 할 일의 텍스트를 렌더링합니다. */}
      {isEditing ? (
        <div>
        <input
          className="mr-2 flex-grow border-2 border-gray-300 rounded-md"
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSave}
          autoFocus
        />
        <button className="bg-green-800 hover:bg-green-600 text-white py-1 px-2 rounded" onClick={handleSave}>Edit</button>
        </div>
      ) : (
        <span
          className="ml-5 text-lg flex-grow"
          style={{ textDecoration: todo.completed ? "line-through" : "none" }}
          onClick={activateEditMode}
        >
          {todo.text}
        </span>
      )}

      {/* 삭제 버튼을 렌더링합니다. */}
      <button className="bg-green-800 text-white hover:bg-red-700 py-1 px-2 rounded" onClick={onDelete}>Delete</button>
    </li>
  );
};

// TodoItem 컴포넌트를 내보냅니다.
export default TodoItem;

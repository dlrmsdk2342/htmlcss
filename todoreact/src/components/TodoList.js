/* 
  할 일 목록을 관리하고 렌더링하는 주요 컴포넌트입니다.
  상태 관리를 위해 `useState` 훅을 사용하여 할 일 목록과 입력값을 관리합니다.
  할 일 목록의 추가, 삭제, 완료 상태 변경 등의 기능을 구현하였습니다.
*/
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import TodoItem from "@/components/TodoItem";
import styles from "@/styles/TodoList.module.css";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// firebase 관련 모듈을 불러옵니다.
import { db } from "@/firebase";
import {
  collection,
  query,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";

// DB의 todos 컬렉션 참조를 만듭니다. 컬렉션 사용시 잘못된 컬렉션 이름 사용을 방지합니다.
const todoCollection = collection(db, "todos");

// TodoList 컴포넌트를 정의합니다.
const TodoList = () => {
  // 상태를 관리하는 useState 훅을 사용하여 할 일 목록과 입력값을 초기화합니다.
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [sortByDate, setSortByDate] = useState("default");
  const [filterBy, setFilterBy] = useState("All");

  const router = useRouter();
  const { data } = useSession({
    required: true,
    onUnauthenticated() {
      router.replace("/login");
    },
  });

  useEffect(() => {
    //console.log("data", data);
    getTodos();
  }, [data]);

  const getTodos = async (sortByDate, filterBy) => {
    // Firestore 쿼리를 만듭니다.

    // const q = query(collection(db, "todos"), where("user", "==", user.uid));
    // const q = query(todoCollection, orderBy("datetime", "asc"));
    if (!data?.user?.name) return;

    let q = query(todoCollection, where("userName", "==", data?.user?.name));
    
    if (sortByDate === "ascending") {
      q = query(q, orderBy("date"));
    } else if (sortByDate === "descending") {
      q = query(q, orderBy("date", "desc"));
    }
    
    if (filterBy === "completed") {
      q = query(q, where("completed", "==", true));
    } else if (filterBy === "uncompleted") {
      q = query(q, where("completed", "==", false));
    }
    // Firestore 에서 할 일 목록을 조회합니다.
    const results = await getDocs(q);
    const newTodos = [];

    // 가져온 할 일 목록을 newTodos 배열에 담습니다.
    results.docs.forEach((doc) => {
      // console.log(doc.data());
      // id 값을 Firestore 에 저장한 값으로 지정하고, 나머지 데이터를 newTodos 배열에 담습니다.
      newTodos.push({ id: doc.id, ...doc.data() });
    });

    setTodos(newTodos);
  };

  const sortTodosByDate = (value) => {
    // 정렬 상태를 변경합니다.
    setSortByDate(value);
    getTodos(value);
  };

  const filterTodosBy = (value) => {
    setFilterBy(value);
    getTodos(sortByDate, value); // 정렬 및 필터 기준을 인자로 넘겨줌
  };  

  // addTodo 함수는 입력값을 이용하여 새로운 할 일을 목록에 추가하는 함수입니다.
  const addTodo = async () => {
    // 입력값이 비어있는 경우 함수를 종료합니다.
    if (input.trim() === "") return;
    // 기존 할 일 목록에 새로운 할 일을 추가하고, 입력값을 초기화합니다.
    // {
    //   id: 할일의 고유 id,
    //   text: 할일의 내용,
    //   completed: 완료 여부,
    // }
    // ...todos => {id: 1, text: "할일1", completed: false}, {id: 2, text: "할일2", completed: false}}, ..

    const timestamp = new Date();
    try {
    // Firestore 에 추가한 할 일을 저장합니다.
    const docRef = await addDoc(todoCollection, {
      userName: data?.user?.name,
      text: input,
      completed: false,
      date: timestamp,
    });

    // id 값을 Firestore 에 저장한 값으로 지정합니다.
    setTodos([...todos, { id: docRef.id, text: input, completed: false }]);
    setInput("");

    // 새로운 할 일이 추가되었으므로 할 일 목록 다시 가져오기
    getTodos();
  } catch (error) {
    console.error("Error adding todo: ", error);
  }
  };

  // toggleTodo 함수는 체크박스를 눌러 할 일의 완료 상태를 변경하는 함수입니다.
  const toggleTodo = (id) => {
    // 할 일 목록에서 해당 id를 가진 할 일의 완료 상태를 반전시킵니다.
    setTodos(
      // todos.map((todo) =>
      //   todo.id === id ? { ...todo, completed: !todo.completed } : todo
      // )
      // ...todo => id: 1, text: "할일1", completed: false
      todos.map((todo) => {
        if (todo.id === id) {
          // Firestore 에서 해당 id를 가진 할 일을 찾아 완료 상태를 업데이트합니다.
          const todoDoc = doc(todoCollection, id);
          updateDoc(todoDoc, { completed: !todo.completed });
          // ...todo => id: 1, text: "할일1", completed: false
          return { ...todo, completed: !todo.completed };
        } else {
          return todo;
        }
      })
    );
  };

  const editTodo = async (id, newText) => {
    const todo = todos.find(todo => todo.id === id);
    const currentUser = data?.user?.name;
    if (!todo || !currentUser) {
      alert("You can't edit this todo.");
      return;
    }
    if (todo.userName !== currentUser) {
      alert("You can only edit your own todos.");
      return;
    }
    // Firestore에서 해당 할 일을 업데이트합니다.
    const todoDoc = doc(todoCollection, id);
    await updateDoc(todoDoc, { text: newText });

    setTodos(
      todos.map((todo) => {
        return todo.id === id ? { ...todo, text: newText} : todo;
      })
    );
  };

  // deleteTodo 함수는 할 일을 목록에서 삭제하는 함수입니다.
  const deleteTodo = async (id) => {
    const todo = todos.find(todo => todo.id === id);
    const currentUser = data?.user?.name;
    if (!todo || !currentUser) {
      alert("You can't delete this todo.");
      return;
    }
    if (todo.userName !== currentUser) {
      alert("You can only delete your own todos.");
      return;
    }
    // Firestore 에서 해당 id를 가진 할 일을 삭제합니다.
    const todoDoc = doc(todoCollection, id);
    await deleteDoc(todoDoc);

    // 해당 id를 가진 할 일을 제외한 나머지 목록을 새로운 상태로 저장합니다.
    // setTodos(todos.filter((todo) => todo.id !== id));
    setTodos(
      todos.filter((todo) => {
        return todo.id !== id;
      })
    );
  };

  // 컴포넌트를 렌더링합니다.
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mt-8 max-w-lg mx-auto">
      <h1 className="text-5xl font-bold text-green-800 shadow-x1 mt-4 mb-8">{data?.user?.name}'s Todo List</h1>
      {/* 할 일을 입력받는 텍스트 필드입니다. */}
      <div className="flex w-full items-center space-x-4 mt-4 mb-8">
      <Input
        type="text"
        className="input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      {/* 할 일을 추가하는 버튼입니다. */}
      <Button className="btn" onClick={addTodo}>
        Add Todo
      </Button>
      </div>
      <div className="flex w-full items-center space-x-4 mb-4">
      <Select value={sortByDate} onValueChange={sortTodosByDate}>
        <SelectTrigger>
        <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default</SelectItem>
          <SelectItem value="ascending">Date (Ascending)</SelectItem>
          <SelectItem value="descending">Date (Descending)</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filterBy} onValueChange={filterTodosBy}>
        <SelectTrigger>
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="uncompleted">Uncompleted</SelectItem>
        </SelectContent>
      </Select>
      </div>
      {/* 할 일 목록을 렌더링합니다. */}
      <ul>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            date={todo.date instanceof Timestamp ? todo.date.toDate().toLocaleString() : todo.date}
            onToggle={() => toggleTodo(todo.id)}
            onDelete={() => deleteTodo(todo.id)}
            onEdit={(newText) => editTodo(todo.id, newText)}
          />
        ))}
      </ul>
    </div>
  );
};

export default TodoList;

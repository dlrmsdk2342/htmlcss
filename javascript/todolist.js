// todolist.js
import TodoItem from './TodoItem.js';

const TodoList = {
    items: [],

    // 새로운 할 일 아이템 추가
    addItem(title, dueDate) {
        const newItem = new TodoItem(title, dueDate);
        this.items.push(newItem);
        this.saveToLocalStorage(); // 변경 내용을 로컬 저장소에 저장
        return newItem;
    },

    // 아이템의 완료 여부 토글
    toggleCompletion(index) {
        this.items[index].completed = !this.items[index].completed;
        this.saveToLocalStorage(); // 변경 내용을 로컬 저장소에 저장
    },

    // 아이템 삭제
    deleteItem(index) {
        this.items.splice(index, 1);
        this.saveToLocalStorage(); // 변경 내용을 로컬 저장소에 저장
    },

    // 로컬 저장소에 할 일 목록 저장
    saveToLocalStorage() {
        localStorage.setItem('todoList', JSON.stringify(this.items));
    },

    // 로컬 저장소에서 할 일 목록 불러오기
    loadFromLocalStorage() {
        const storedItems = localStorage.getItem('todoList');
        if (storedItems) {
            this.items = JSON.parse(storedItems);
        }
    }
};

export default TodoList;

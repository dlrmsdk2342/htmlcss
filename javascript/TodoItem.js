// TodoItem.js

// TodoItem 클래스 정의
export default class TodoItem {
    constructor(title, dueDate) {
        this.title = title;
        this.dueDate = dueDate;
        this.completed = false; // 아이템이 생성될 때는 완료되지 않은 상태로 초기화
    }
}

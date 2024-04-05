import TodoList from './todolist.js';

// UI를 관리하고 렌더링하는 app 객체 모듈 정의
const app = {
    todolist: TodoList,

    // 할 일 목록을 렌더링하는 메서드
    renderTodoList() {
        const todoList = document.getElementById('todoList');
        todoList.innerHTML = ''; // 기존의 Todo 리스트를 모두 삭제

        // 저장된 Todo 아이템들을 가져와서 UI에 추가
        this.todolist.items.forEach((item, index) => {
            const listItem = document.createElement('li');

            // Todo 아이템 완료 체크박스
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = item.completed;
            checkbox.addEventListener('change', () => this.toggleCompletion(index));

            // Todo 아이템 텍스트
            const itemText = document.createElement('span');
            itemText.textContent = `${item.title} - ${item.dueDate}`;

            // Todo 아이템 삭제 아이콘
            const deleteBtn = document.createElement('button'); // 버튼 요소 생성
            deleteBtn.textContent = '🗑️'; // 버튼 텍스트 설정
            deleteBtn.className = 'delete-btn'; // 클래스 설정
            deleteBtn.addEventListener('click', () => this.deleteItem(index)); // 클릭 이벤트 리스너 설정


            // 아이템을 리스트 아이템에 추가
            listItem.appendChild(checkbox);
            listItem.appendChild(itemText);
            listItem.appendChild(deleteBtn);

            if (item.completed) {
                listItem.classList.add('completed');
            }

            todoList.appendChild(listItem);
        });
    },

    // Todo 아이템의 완료 여부를 토글하는 메서드
    toggleCompletion(index) {
        this.todolist.toggleCompletion(index);
        this.renderTodoList(); // 완료 여부 변경 후 UI를 업데이트하여 변경된 정보를 표시
    },

    deleteItem(index) {
        this.todolist.deleteItem(index);
        this.renderTodoList();
    },

    // 애플리케이션을 초기화하고 실행하는 메서드
    init() {
        this.renderTodoList(); // 초기 Todo 리스트를 UI에 렌더링
        const todoForm = document.getElementById('todoForm');
        todoForm.addEventListener('submit', this.handleFormSubmit.bind(this)); // 폼 제출 이벤트 리스너 추가
    },

    // Todo 아이템을 추가하는 메서드
    handleFormSubmit(event) {
        event.preventDefault(); // 폼 제출 기본 동작 막기
        const titleInput = document.getElementById('title');
        const dueDateInput = document.getElementById('dueDate');
        const title = titleInput.value.trim();
        const dueDate = dueDateInput.value;
        if (title !== '') {
            this.todolist.addItem(title, dueDate);
            this.renderTodoList(); // 추가 후 UI를 업데이트하여 새로운 아이템을 표시
            titleInput.value = ''; // 입력 필드 초기화
            dueDateInput.value = ''; // 입력 필드 초기화
        } else {
            alert('제목 또는 날짜를 입력하세요.');
        }
    }
};

// 애플리케이션 초기화 및 실행
app.init();

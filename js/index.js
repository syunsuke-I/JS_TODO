import * as todoUtils from './todoUtils.js';

const todoApp = (function() {
  let id = 0;
  let totalTaskCounter = 0;
  let completedTaskCounter = 0;
  let incompleteTaskCounter = 0;

  let isButtonMousedown = false;

  /**
   * タスクのカウント表示を更新します。
   * 全てのタスク、完了済みのタスク、未完了のタスクのカウントを更新します。
   */
  function updateTaskCountDisplay() {
    document.querySelector('#totalTaskCount').textContent = `全てのタスク：${totalTaskCounter}`;
    document.querySelector('#completedTaskCount').textContent = `完了済み：${completedTaskCounter}`;
    document.querySelector('#incompleteTaskCount').textContent = `未完了：${incompleteTaskCounter}`;
  }

    return {
      createTodo : function(inputValue) {
          // カウンターをインクリメント
          id++;
          totalTaskCounter++;
          incompleteTaskCounter++;
          // 新しいTODO項目を生成
          const listItem = createTodoItem(id, inputValue);
          createBtnZone(id,listItem);         
          document.querySelector('#todoList').appendChild(listItem);
          // 表示の更新
          updateTaskCountDisplay();
          // 入力欄をクリア
          document.querySelector('#todoInput').value = '';
      },
      completed : function (id) {
        var todo_item = todoUtils.getListItemById(id);
        if(todo_item.style.textDecoration == "line-through"){
          todo_item.style.textDecoration = "none";
          completedTaskCounter--;
          incompleteTaskCounter++;
        }else{
          todo_item.style.textDecoration = "line-through";
          completedTaskCounter++;
          incompleteTaskCounter--;
        }
        // 表示の更新
        updateTaskCountDisplay();
      },
      editTodo: function(id) {
        const listItem = todoUtils.getListItemById(id);
        todoUtils.hideControls(id,listItem);
        appendSaveButton(listItem, id);
        todoUtils.replaceSpanWithInput(listItem, id,
        function() {
          return todoApp.getSaveButtonMousedown();
        },
        function() {
          todoApp.saveTodo(id);
        },
        function() {
          return todoApp.setSaveButtonMousedown(false);
        }
        );
      },
      saveTodo: function(id) {
        const listItem = todoUtils.getListItemById(id);
        const inputElement = listItem.querySelector(`input[type="text"]`);
        const inputValue = inputElement.value.trim();
        if (inputValue === '') {
          todoUtils.displayInputError(inputElement);
          return;
        }
        todoUtils.clearInputError(inputElement);        

        todoUtils.replaceInputWithSpan(listItem, inputValue);
        todoUtils.removeSaveButton(id);
        todoUtils.showControls(id,listItem);
      },
      deleteTodo : function(id) {
        const isConfirmed = window.confirm("本当によろしいですか？");
        if (!isConfirmed) return;
        const todoItem = todoUtils.getListItemById(id);
        if(todoItem.style.textDecoration == "line-through"){
          completedTaskCounter--;
        }else{
          incompleteTaskCounter--; 
        }
        totalTaskCounter--;
        // 表示の更新
        updateTaskCountDisplay();
        todoItem.remove();
      },
      setSaveButtonMousedown: function(value) {
        isButtonMousedown = value;
      },
      getSaveButtonMousedown: function() {
        return isButtonMousedown;
      }      
    };
  }
)();


/**
 * 「#createTodoButton」ボタンがクリックされたときのイベントリスナーを設定します。
 * クリックされると、入力フィールドから値を取得し、新しいTODOを作成します。
 */
document.querySelector('#createTodoButton').addEventListener('click', function() {
  // スペースのみ入力対策
  const inputValue = todoInput.value.trim();

  if (inputValue === '') {
    todoUtils.displayInputError(todoInput);
    return;
  }

  todoUtils.clearInputError(todoInput);
  todoApp.createTodo(inputValue);
});

/**
 * 指定されたIDと入力値に基づいて新しいTODOアイテムのリスト要素を作成します。
 * このリスト要素には、編集および削除ボタンとチェックボックスとテキストが含まれています。
 * 
 * @param {number} id - 新しいTODOアイテムに関連付けられる一意のID。
 * @param {string} inputValue - TODOアイテムのテキストとして表示される内容。
 * @returns {HTMLLIElement} 作成されたTODOアイテムのリスト要素。
 */

function createTodoItem(id, inputValue) {
  const listItem = document.createElement('li');
  listItem.className = "flex items-center justify-between";
  listItem.id = `todo-${id}`;
  
  const contentDiv = document.createElement('div');
  contentDiv.className = "flex items-center";
  
  const checkbox = createCheckbox(id);
  contentDiv.appendChild(checkbox);
  
  const span = document.createElement('span');
  span.textContent = inputValue;
  // 長すぎる文字対策
  span.className = "inline-block w-60 overflow-auto";
  contentDiv.appendChild(span);
  
  listItem.appendChild(contentDiv);
  return listItem;
}

/**
 * 指定されたIDに基づいて新しいチェックボックス要素を作成します。
 * このチェックボックスは、クリックされると`todoApp.completed`関数が呼び出されるように設定されています。
 * 
 * @param {number} id - チェックボックスに関連付けられるTODOアイテムの一意のID。
 * @returns {HTMLInputElement} 作成されたチェックボックスの要素。
 */
function createCheckbox(id) {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'mr-2';
  addEventListenerToButton(checkbox, id, todoApp.completed);
  return checkbox;
}

/**
 * 指定されたIDとリストアイテムに対してボタンゾーンを作成します。
 * このゾーンには「編集」と「削除」のボタンが含まれます。
 * 
 * @param {number} id - TODOアイテムの一意のID。
 * @param {HTMLElement} listItem - ボタンゾーンを追加するリストアイテムの要素。
 * @returns {HTMLElement} 作成されたボタンゾーンの要素。
 */

function createBtnZone(id,listItem,){ 
  const btnZone = document.createElement('div');
  btnZone.id = `js-btn-zone-${id}`;
  listItem.appendChild(btnZone);
  createEditButton(id,btnZone);
  createDeleteButton(id,btnZone)  
  return btnZone;
}

/**
 * 編集ボタンを作成し、指定されたボタンゾーンに追加します。このボタンはクリックされると指定されたIDを使用して`todoApp.editTodo`関数を呼び出します。
 *
 * @param {number|string} id - 編集ボタンがクリックされたときに`todoApp.editTodo`に渡されるID。
 * @param {HTMLElement} btnZone - 編集ボタンが追加されるボタンゾーンの要素。
 * @returns {HTMLElement} - 作成された削除ボタンの要素。
 */

function createEditButton(id,btnZone) {
  const editButton = document.createElement('button');
  editButton.textContent = '編集';
  editButton.className = 'text-blue-500';
  editButton.style.zIndex = '998';
  editButton.id = `edit-btn-${id}`;  
  addEventListenerToButton(editButton, id, todoApp.editTodo);
  btnZone.appendChild(editButton);
  return editButton;
}

/**
 * 削除ボタンを作成し、指定されたボタンゾーンに追加します。このボタンはクリックされると指定されたIDを使用して`todoApp.deleteTodo`関数を呼び出します。
 *
 * @param {number|string} id - 削除ボタンがクリックされたときに`todoApp.deleteTodo`に渡されるID。
 * @param {HTMLElement} btnZone - 削除ボタンが追加されるボタンゾーンの要素。
 * @returns {HTMLElement} - 作成された削除ボタンの要素。
 */

function createDeleteButton(id,btnZone) {
  const deleteButton = document.createElement('button');
  deleteButton.textContent = '削除';
  deleteButton.className = 'ml-2 text-red-500';
  deleteButton.style.zIndex = '998';
  deleteButton.id = `delete-btn-${id}`;
  addEventListenerToButton(deleteButton, id, todoApp.deleteTodo); 
  btnZone.appendChild(deleteButton);
  return deleteButton;
}

/**
 * 保存ボタンを作成し、指定されたボタンゾーンに追加します。このボタンはクリックされると指定されたIDを使用して`todoApp.saveTodo`関数を呼び出します。
 *
 * @param {number|string} id - 保存ボタンがクリックされたときに`todoApp.saveTodo`に渡されるID。
 * @param {HTMLElement} btnZone - 保存ボタンが追加されるボタンゾーンの要素。
 * @returns {HTMLElement} - 作成された保存ボタンの要素。
 */
function createSaveButton(id) {
  const saveButton = document.createElement('button');
  saveButton.textContent = '保存';
  saveButton.className = 'ml-2 text-blue-500';
  saveButton.style.zIndex = '999';
  saveButton.id = `js-save-btn-${id}`;
  saveButton.addEventListener('mousedown', function() {
    todoApp.setSaveButtonMousedown(true);
  });
  addEventListenerToButton(saveButton, id, todoApp.saveTodo);
  return saveButton;
}

/**
 * 指定されたリストアイテムに「保存」ボタンを追加します。
 * 
 * @param {HTMLElement} listItem - ボタンを追加するリストアイテムのDOM要素。
 * @param {number} id - TODOアイテムの一意のID。
 */
function appendSaveButton(listItem, id) {
  const btnZone = listItem.querySelector(`#js-btn-zone-${id}`);
  const saveButton = createSaveButton(id);
  btnZone.appendChild(saveButton);
}

/**
 * 指定されたボタンにクリックイベントリスナーを追加し、クリック時に指定されたIDを使用してコールバック関数を呼び出します。
 *
 * @param {HTMLElement} button - イベントリスナーが追加されるボタン要素。
 * @param {number|string} id - ボタンがクリックされたときにコールバックに渡されるID。
 * @param {Function} callback - ボタンがクリックされたときに呼び出される関数。
 */
function addEventListenerToButton(button, id, callback) {
  button.addEventListener('click', function() {
    callback(id);
  });
}

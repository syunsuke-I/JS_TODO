// フォーカスの管理
let isRefocusing = false;

/**
 * 指定されたIDに関連するTODOアイテムのリスト要素を取得します。
 * 
 * @param {number} id - TODOアイテムの一意のID。
 * @returns {HTMLLIElement} 指定されたIDを持つTODOアイテムのリスト要素。
 */
export function getListItemById(id) {
  const todoItem = document.querySelector(`#todo-${id}`);
  return todoItem.closest('li');
}

/**
 * リストアイテム内の入力要素をテキストを含む<span>要素に置き換えます。
 * 
 * @param {HTMLLIElement} listItem - 編集中のTODOアイテムのリスト要素。
 * @param {string} newText - 新しいテキスト内容。
 */
export function replaceInputWithSpan(listItem, newText) {
  const inputElement = listItem.querySelector(`input[type="text"]`);
  const spanElement = document.createElement('span');
  spanElement.textContent = newText;
  inputElement.replaceWith(spanElement);
}

/**
 * リストアイテム内の<span>要素を入力要素に置き換えます。
 * 
 * @param {HTMLLIElement} listItem - 編集するTODOアイテムのリスト要素。
 * @param {number} id - TODOアイテムの一意のID。
 */
export function replaceSpanWithInput(listItem, id, getSaveButtonMousedown,onSaveCallback,setSaveButtonMousedown) {
  const spanElement = listItem.querySelector('span');
  const currentText = spanElement.textContent;
  const originalText = spanElement.textContent;

  const inputElement = document.createElement('input');
  inputElement.type = 'text';
  inputElement.value = currentText;
  inputElement.className = 'border rounded-md';
  inputElement.id = `input-${id}`;
  spanElement.replaceWith(inputElement);
  inputElement.focus();
  inputElement.setSelectionRange(currentText.length, currentText.length);

  inputElement.addEventListener('blur', function() {
    handleBlur(inputElement, originalText, id, listItem, getSaveButtonMousedown, onSaveCallback, setSaveButtonMousedown);
  });
}

/**
 * リストアイテム内の制御ボタン（編集、削除、チェックボックス）を表示します。
 * 
 * @param {HTMLLIElement} listItem - 制御ボタンを表示するTODOアイテムのリスト要素。
 * @param {number} id - TODOアイテムの一意のID。
 */
export function   showControls(id,listItem) {
  const deleteButton = document.querySelector(`#delete-btn-${id}`);
  const checkbox = listItem.querySelector('input[type="checkbox"]');
  const editButton = document.querySelector(`#edit-btn-${id}`);
  deleteButton.style.display = 'inline-block'; 
  checkbox.style.display = 'inline-block';
  editButton.style.display = 'inline-block';
}

/**
 * リストアイテム内の制御ボタン（編集、削除、チェックボックス）を非表示にします。
 * 
 * @param {HTMLLIElement} listItem - 制御ボタンを非表示にするTODOアイテムのリスト要素。
 * @param {number} id - TODOアイテムの一意のID。
 */
export function hideControls(id,listItem) {
  const deleteButton = document.querySelector(`#delete-btn-${id}`);
  const checkbox = listItem.querySelector('input[type="checkbox"]');
  const editButton = document.querySelector(`#edit-btn-${id}`);

  deleteButton.style.display = 'none';
  checkbox.style.display = 'none';
  editButton.style.display = 'none';
}

/**
 * 指定されたIDの保存ボタンを削除します。
 * 
 * @param {number} id - 保存ボタンを削除するTODOアイテムの一意のID。
 */
export function removeSaveButton(id) {
  const btnZone = document.querySelector(`#js-btn-zone-${id}`);
  const saveBtn = btnZone.querySelector(`#js-save-btn-${id}`);
  if (saveBtn) {
    btnZone.removeChild(saveBtn);
  }
}

/**
 * 入力エラーの表示を行います。
 * @param {HTMLElement} inputElement - エラー表示を行う入力要素
 */
export function displayInputError(inputElement) {
  inputElement.classList.add('input-error', 'shake');
  inputElement.addEventListener('animationend', function() {
    inputElement.classList.remove('shake');
  });
}

/**
 * 入力エラーの表示をクリアします。
 * @param {HTMLElement} inputElement - エラー表示をクリアする入力要素
 */
export function clearInputError(inputElement) {
  inputElement.classList.remove('input-error');
}

/**
 * inputElementのblurイベントのハンドラーです。
 * 入力内容がoriginalTextと異なる場合、確認ダイアログを表示します。
 * ユーザーが変更内容の保存を選択した場合、onSaveCallback関数を実行します。
 * 
 * @param {HTMLInputElement} inputElement - 編集中のinput要素
 * @param {string} originalText - 編集開始時のテキスト内容
 * @param {number} id - TODOアイテムのID
 * @param {HTMLElement} listItem - 編集中のTODOアイテムのリスト要素
 * @param {Function} getSaveButtonMousedown - 保存ボタンがマウスダウンされたかを返す関数
 * @param {Function} onSaveCallback - 保存処理を行うコールバック関数
 * @param {Function} setSaveButtonMousedown - 保存ボタンのマウスダウン状態を設定する関数
 */
function handleBlur(inputElement, originalText, id, listItem, getSaveButtonMousedown, onSaveCallback, setSaveButtonMousedown) {
  if(getSaveButtonMousedown()) {
    setSaveButtonMousedown();
    return;
  }
  if(isRefocusing){
    isRefocusing = false;
    return;
  }
  if (inputElement.value !== originalText) {
    const isConfirmed = window.confirm('変更内容を保存しますか？');
    if(isConfirmed){
      onSaveCallback();
      showControls(id, listItem);
    }else{
      isRefocusing = true;
      inputElement.focus();
    }
  }else{
    onSaveCallback();
    showControls(id, listItem);
  }
}
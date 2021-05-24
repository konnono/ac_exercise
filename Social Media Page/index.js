const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const USERS_PER_PAGE = 16

const dataPanel = document.querySelector('#data-panel')
const paginator = document.querySelector('#paginator')

const users = []

const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
let filteredUsers = []

const favoriteUsers = []

// render user list function
function renderUserList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // title, image
    // title, image, id
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${item.avatar}" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h4 class="card-title text-center">${item.name} ${item.surname}</h4>
            </div>
            <div class="card-footer text-center">
              <button class="btn btn-primary btn-show-user" data-toggle="modal" data-target="#user-modal" data-id="${item.id}">了解更多</button>
              <button class="btn btn-info btn-favorite-user" data-id="${item.id}">+
              </button>
            </div>
          </div>
        </div>
      </div>`
  })
  dataPanel.innerHTML = rawHTML
}

// render paginator
function renderPaginator(count) {
  const numOfPages = Math.ceil(count / USERS_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getUsersByPage(page) {
  const data = filteredUsers.length ? filteredUsers : users
  const startIndex = (page - 1) * USERS_PER_PAGE
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}

// Render user by page
axios.get(INDEX_URL).then((response) => {
  users.push(...response.data.results)
  renderPaginator(users.length)
  renderUserList(getUsersByPage(1))
})
  .catch((error) => {
    console.log(error);
  })

// add event listener to dataPanel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-user')) {
    showUserModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-favorite-user')) {
    addtoFavorite(event.target.dataset.id)

  }
})

// add to favorite
function addtoFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  const user = users.find((user) => user.id.toString() === id.toString())

  if (list.some((user) => user.id.toString() === id.toString())) {
    return alert('朋友已在最愛名單中！')
  }
  list.push(user)
  localStorage.setItem('favoriteUsers', JSON.stringify(list))
  alert(`完成加入${user.name}至最愛名單！`)
}

// Render user Modal
function showUserModal(id) {
  const modalTitle = document.querySelector('#user-modal-name')
  const modalImage = document.querySelector('#user-modal-image')
  const modalGender = document.querySelector('#user-modal-gender')
  const modalBirthday = document.querySelector('#user-modal-birthday')
  const modalRegion = document.querySelector('#user-modal-region')
  const modalEmail = document.querySelector('#user-modal-email')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data
    modalTitle.textContent = `${data.name} ${data.surname}`
    modalImage.innerHTML = `< img src = "${data.avatar}" alt = "user-avatar" class= "img-fluid" > `
    modalGender.textContent = `Gender: ${data.gender}`
    modalBirthday.textContent = `Date of Birth: ${data.birthday}`
    modalRegion.textContent = `Region: ${data.region}`
    modalEmail.textContent = `Email: ${data.email}`
  })
}

// add event listener to Search Form
searchForm.addEventListener('click', (event) => {
  event.preventDefault()

  if (event.target.classList.contains('reset')) {
    searchInput.value = ''
    renderUserList(getUsersByPage(1)) //預設顯示第 1 頁的搜尋結果
  } else if (event.target.classList.contains('submit')) {
    const keyword = searchInput.value.trim().toUpperCase()
    searchKeyword(keyword)
  }
})

// Search for Keyword
function searchKeyword(keyword) {
  // 將user的姓氏和名字合併後再與搜尋關鍵字比對，並將符合搜尋關鍵字的使用者顯示於頁面
  if (keyword.length !== 0) {
    filteredUsers = users.filter(user => (user.name + user.surname).trim().toUpperCase().includes(keyword))

    if (filteredUsers.length === 0) {
      alert(`查詢不到名字內含有「${keyword}」的使用者`)
    } else {
      renderPaginator(filteredUsers.length)
      renderUserList(getUsersByPage(1)) //預設顯示第 1 頁的搜尋結果
    }
  }
}

// listen to paginator
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderUserList(getUsersByPage(page))
})



const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const USERS_PER_PAGE = 16

const dataPanel = document.querySelector('#data-panel')
const users = []

const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

const favoriteUsers = JSON.parse(localStorage.getItem('favoriteUsers'))

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
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X
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
  const startIndex = (page - 1) * USERS_PER_PAGE
  return favoriteUsers.slice(startIndex, startIndex + USERS_PER_PAGE)
}

// Render favorite users by page
renderPaginator(favoriteUsers.length)
renderUserList(getUsersByPage(1))  //預設顯示第 1 頁的搜尋結果


// add event listener to dataPanel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-user')) {
    showUserModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFavorite(event.target.dataset.id)
  }
})

// remove from favorite
function removeFavorite(id) {
  console.log(id)
  if (!favoriteUsers) return

  const userIndex = favoriteUsers.findIndex((user) => user.id.toString() === id.toString())
  console.log(userIndex)
  if (userIndex === -1) return

  favoriteUsers.splice(userIndex, 1)
  console.log(favoriteUsers)
  localStorage.setItem('favoriteUsers', JSON.stringify(favoriteUsers))
  renderPaginator(favoriteUsers.length)
  renderUserList(getUsersByPage(1))  //預設顯示第 1 頁的搜尋結果
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
    modalImage.innerHTML = `<img src="${data.avatar}" alt="user-avatar" class="img-fluid">`
    modalGender.textContent = `Gender: ${data.gender}`
    modalBirthday.textContent = `Date of Birth: ${data.birthday}`
    modalRegion.textContent = `Region: ${data.region}`
    modalEmail.textContent = `Email: ${data.email}`
  })
}

// listen to paginator
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderUserList(getUsersByPage(page))
})

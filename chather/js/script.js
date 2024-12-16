class User {
    #name;
    #age;
    #isNew;
    #image;
    #revShareUrl;
  
    constructor(data) {
      this.#name = data.username;
      this.#age = data.age;
      this.#isNew = data.is_new;
      this.#image = data.image_url;
      this.#revShareUrl = data.chat_room_url_revshare;
    }
  
    get name() {
      return this.#name;
    }
    get age() {
      return this.#age;
    }
    get isNew() {
      return this.#isNew;
    }
    get image() {
      return this.#image;
    }
    get revShareUrl() {
      return this.#revShareUrl;
    }
  }
  
  class UserGrid {
    static #usersPerPage = 25;
    #currentPage;
    #users;
    #clickCount;
    #usersContainer;
    #userDetailsIframe;
    #prevPageButton;
    #nextPageButton;
    #clickCountDiv;
    #clickedUsersList;
  
    constructor(users) {
      this.#currentPage = 1;
      this.#users = users;
      this.#clickCount = 0;
      this.#usersContainer = document.getElementById('users-container');
      this.#userDetailsIframe = document.getElementById('user-details');
      this.#prevPageButton = document.getElementById('prev-page');
      this.#nextPageButton = document.getElementById('next-page');
      this.#clickCountDiv = document.getElementById('click-count');
      this.#clickedUsersList = document.getElementById('clicked-users-list');
  
      this.init();
    }
  
    init() {
      this.renderUserGrid();
      this.addEventListeners();
      this.loadClickCount();
      this.loadClickedUsers();
    }
  
    renderUserGrid() {
      const startIndex = (this.#currentPage - 1) * UserGrid.#usersPerPage;
      const endIndex = startIndex + UserGrid.#usersPerPage;
      this.#usersContainer.innerHTML = '';
  
      for (let i = startIndex; i < endIndex && i < this.#users.length; i++) {
        const user = this.#users[i];
        const userDiv = document.createElement('div');
        userDiv.classList.add('user-image');
  
        const image = document.createElement('img');
        image.src = user.image;
        image.addEventListener('click', () => {
          this.handleUserClick(user);
        });
  
        const ageSpan = document.createElement('span');
        ageSpan.classList.add('user-details-small', 'age');
        ageSpan.textContent = user.age;
  
        const newSpan = document.createElement('span');
        newSpan.classList.add('user-details-small', 'new');
        newSpan.textContent = user.isNew ? 'New' : '';
  
        userDiv.appendChild(image);
        userDiv.appendChild(ageSpan);
        userDiv.appendChild(newSpan);
        this.#usersContainer.appendChild(userDiv);
      }
  
      this.updatePagination();
    }
  
    addEventListeners() {
      this.#prevPageButton.addEventListener('click', () => this.previousPage());
      this.#nextPageButton.addEventListener('click', () => this.nextPage());
    }
  
    @logClick
    handleUserClick(user) {
      this.#clickCount++;
      this.#clickCountDiv.textContent = this.#clickCount;
      this.#userDetailsIframe.src = user.revShareUrl;
      this.saveClickedUser(user);
      this.displayClickedUsers();
    }
  
    saveClickedUser(user) {
      let clickedUsers = JSON.parse(localStorage.getItem('clickedUsers')) || [];
      if (!clickedUsers.find(u => u.name === user.name)) {
        clickedUsers.push({name: user.name, image: user.image, revShareUrl: user.revShareUrl});
        localStorage.setItem('clickedUsers', JSON.stringify(clickedUsers));
      }
    }
  
    displayClickedUsers() {
      this.#clickedUsersList.innerHTML = '';
      let clickedUsers = JSON.parse(localStorage.getItem('clickedUsers')) || [];
      clickedUsers.forEach(user => {
        const userImage = document.createElement('img');
        userImage.src = user.image;
        userImage.addEventListener('click', () => {
          this.#userDetailsIframe.src = user.revShareUrl;
        });
        this.#clickedUsersList.appendChild(userImage);
      });
      this.#clickedUsersList.classList.add('show');
    }
  
    loadClickedUsers() {
      this.displayClickedUsers();
    }
  
    updatePagination() {
      this.#prevPageButton.disabled = this.#currentPage === 1;
      this.#nextPageButton.disabled = (this.#currentPage * UserGrid.#usersPerPage) >= this.#users.length;
    }
  
    previousPage() {
      if (this.#currentPage > 1) {
        this.#currentPage--;
        this.renderUserGrid();
      }
    }
  
    nextPage() {
      if ((this.#currentPage * UserGrid.#usersPerPage) < this.#users.length) {
        this.#currentPage++;
        this.renderUserGrid();
      }
    }
  
    loadClickCount() {
      const storedClickCount = localStorage.getItem('clickCount');
      if (storedClickCount) {
        this.#clickCount = parseInt(storedClickCount);
        this.#clickCountDiv.textContent = this.#clickCount;
      }
    }
  }
  
  // Decorator function to log clicks
  function logClick(target, name, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function(...args) {
      console.log(`User clicked on ${args[0].name}`);
      return originalMethod.apply(this, args);
    };
    return descriptor;
  }
  
  // Fetch user data from JSON file
  fetch('https://chaturbate.com/api/public/affiliates/onlinerooms/?wm=9cg6A&client_ip=request_ip')
    .then(response => response.json())
    .then(data => {
      const users = data.results.map(userData => new User(userData));
      const userGrid = new UserGrid(users);
    });
  
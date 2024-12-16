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

    get name() { return this.#name; }
    get age() { return this.#age; }
    get isNew() { return this.#isNew; }
    get image() { return this.#image; }
    get revShareUrl() { return this.#revShareUrl; }
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
    #sessionClicks = {};
    #overallClicks = {};
    #deletedUsers = new Set();
    #searchInput;

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
        this.#searchInput = document.getElementById('search-input');

        this.loadDeletedUsers();
        this.loadOverallClicks();
        this.init();

        // Fetch data on load and then every 5 minutes
        this.fetchData();
        setInterval(() => this.fetchData(), 5 * 60 * 1000);
    }

    async init() {
        this.renderUserGrid();
        this.addEventListeners();
        this.loadClickCount();
        this.loadClickedUsers();
        this.setupSearch();
    }

    async fetchData() {
        const response = await fetch('https://chaturbate.com/api/public/affiliates/onlinerooms/?wm=9cg6A&client_ip=request_ip');
        const data = await response.json();
        this.#users = data.results
            .filter(user => !this.#deletedUsers.has(user.username))
            .map(userData => new User(userData));
        this.renderUserGrid();
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

            const clickCountSpan = document.createElement('span');
            clickCountSpan.classList.add('user-details-small', 'click-count');
            const sessionCount = this.#sessionClicks[user.name] || 0;
            const overallCount = this.#overallClicks[user.name] || 0;
            clickCountSpan.textContent = `${sessionCount}/${overallCount}`;

            image.addEventListener('dblclick', () => {
                this.deleteUser(user);
            });

            userDiv.appendChild(image);
            userDiv.appendChild(ageSpan);
            userDiv.appendChild(clickCountSpan);
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
        this.#sessionClicks[user.name] = (this.#sessionClicks[user.name] || 0) + 1;
        this.#overallClicks[user.name] = (this.#overallClicks[user.name] || 0) + 1;
        localStorage.setItem('overallClicks', JSON.stringify(this.#overallClicks));
        this.renderUserGrid(); // Re-render to update click counts
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
            const userItem = document.createElement('div');
            userItem.classList.add('user-item');

            const userImage = document.createElement('img');
            userImage.src = user.image;
            userImage.addEventListener('click', () => {
                this.#userDetailsIframe.src = user.revShareUrl;
            });

            const userName = document.createElement('span');
            userName.textContent = user.name;

            userItem.appendChild(userImage);
            userItem.appendChild(userName);
            this.#clickedUsersList.appendChild(userItem);
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

    loadDeletedUsers() {
        const deletedUsers = JSON.parse(localStorage.getItem('deletedUsers')) || [];
        this.#deletedUsers = new Set(deletedUsers);
    }

    deleteUser(user) {
        this.#deletedUsers.add(user.name);
        localStorage.setItem('deletedUsers', JSON.stringify(Array.from(this.#deletedUsers)));
        this.#users = this.#users.filter(u => u.name !== user.name);
        this.renderUserGrid();
    }

    loadOverallClicks() {
        const storedClicks = JSON.parse(localStorage.getItem('overallClicks')) || {};
        this.#overallClicks = storedClicks;
    }

    setupSearch() {
        let searchSuggestions = [];
        this.#searchInput.addEventListener('input', () => {
            const searchTerm = this.#searchInput.value.toLowerCase();
            const filteredUsers = this.#users.filter(user => {
                return Object.values(user).some(value =>
                    String(value).toLowerCase().includes(searchTerm)
                );
            });
            searchSuggestions = filteredUsers.map(user => user.name);
            this.showSearchSuggestions(searchSuggestions);
        });

        this.#searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                const searchTerm = this.#searchInput.value.toLowerCase();
                if (searchSuggestions.includes(searchTerm)) {
                    // User found, handle user click
                    const selectedUser = this.#users.find(user => user.name.toLowerCase() === searchTerm);
                    this.handleUserClick(selectedUser);
                } else {
                    // Copy text to clipboard
                    navigator.clipboard.writeText(searchTerm)
                        .then(() => {
                            console.log('Text copied to clipboard!');
                        })
                        .catch(err => {
                            console.error('Failed to copy text: ', err);
                        });
                }
            }
        });
    }

    showSearchSuggestions(suggestions) {
        // Implement your logic to display suggestions
        // This is a basic example, you can customize it further
        const suggestionsList = document.getElementById('search-suggestions');
        suggestionsList.innerHTML = '';
        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('li');
            suggestionItem.textContent = suggestion;
            suggestionItem.addEventListener('click', () => {
                this.#searchInput.value = suggestion;
                suggestionsList.innerHTML = '';
            });
            suggestionsList.appendChild(suggestionItem);
        });
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

// Create UserGrid instance
const userGrid = new UserGrid([]);

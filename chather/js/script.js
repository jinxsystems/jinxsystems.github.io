class User {
    #name;
    #age;
    #isNew;
    #image;

    constructor(name, age, isNew, image) {
        this.#name = name;
        this.#age = age;
        this.#isNew = isNew;
        this.#image = image;
    }

    get name() { return this.#name; }
    get age() { return this.#age; }
    get isNew() { return this.#isNew; }
    get image() { return this.#image; }
}

class UserGrid {
    constructor(users) {
        this.users = users;
        this.currentPage = 1;
        this.usersPerPage = 25;
        this.selectedUser = null;
        this.clickCount = 0;

        this.init();
    }

    init() {
        this.renderUserGrid();
        this.renderPagination();
        this.addEventListeners();
        this.loadClickCount();
        this.loadSelectedUsers();
    }

    renderUserGrid() {
        const startIndex = (this.currentPage - 1) * this.usersPerPage;
        const endIndex = startIndex + this.usersPerPage;
        const userGrid = document.getElementById('user-grid');
        userGrid.innerHTML = '';

        for (let i = startIndex; i < endIndex && i < this.users.length; i++) {
            const user = this.users[i];
            const userDiv = document.createElement('div');
            const userImage = document.createElement('img');
            userImage.src = user.image;
            userImage.alt = user.name;
            userImage.title = `Age: ${user.age}, New: ${user.isNew}`;
            userDiv.appendChild(userImage);
            userGrid.appendChild(userDiv);
        }
    }

    renderPagination() {
        const pageCount = Math.ceil(this.users.length / this.usersPerPage);
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';

        for (let i = 1; i <= pageCount; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.addEventListener('click', () => {
                this.currentPage = i;
                this.renderUserGrid();
            });
            pagination.appendChild(button);
        }
    }

    addEventListeners() {
        const userGrid = document.getElementById('user-grid');
        userGrid.addEventListener('click', (event) => {
            const image = event.target;
            if (image.tagName === 'IMG') {
                this.selectedUser = this.getSelectedUser(image.src);
                this.updateIframe();
                this.updateClickCount();
                this.saveSelectedUsers();
            }
        });

        const userListButton = document.getElementById('user-list-button');
        const modal = document.getElementById('user-list-modal');
        const close = document.querySelector('.close');

        userListButton.addEventListener('click', () => {
            this.renderUserList();
            modal.style.display = 'block';
        });

        close.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    getSelectedUser(imageSrc) {
        for (let i = 0; i < this.users.length; i++) {
            const user = this.users[i];
            if (user.image === imageSrc) {
                return user;
            }
        }
        return null;
    }

    updateIframe() {
        const iframe = document.getElementById('user-iframe');
        iframe.src = this.selectedUser ? `user.html?id=${this.selectedUser.name}` : '';
    }

    updateClickCount() {
        this.clickCount++;
        const clickCountDiv = document.getElementById('click-count');
        clickCountDiv.textContent = `Click Count: ${this.clickCount}`;
        localStorage.setItem('clickCount', this.clickCount);
    }

    loadClickCount() {
        const storedClickCount = localStorage.getItem('clickCount');
        if (storedClickCount) {
            this.clickCount = parseInt(storedClickCount);
            this.updateClickCount();
        }
    }

    saveSelectedUsers() {
        const selectedUserNames = this.users.filter(user => user.selected).map(user => user.name);
        localStorage.setItem('selectedUsers', JSON.stringify(selectedUserNames));
    }

    loadSelectedUsers() {
        const storedSelectedUsers = localStorage.getItem('selectedUsers');
        if (storedSelectedUsers) {
            const selectedUserNames = JSON.parse(storedSelectedUsers);
            this.users.forEach(user => {
                if (selectedUserNames.includes(user.name)) {
                    user.selected = true;
                }
            });
        }
    }

    renderUserList() {
        const userListContent = document.getElementById('user-list-content');
        userListContent.innerHTML = '';
        const selectedUsers = this.users.filter(user => user.selected);

        if (selectedUsers.length > 0) {
            const userList = document.createElement('ul');
            selectedUsers.forEach(user => {
                const listItem = document.createElement('li');
                const userImage = document.createElement('img');
                userImage.src = user.image;
                userImage.alt = user.name;
                listItem.appendChild(userImage);
                userList.appendChild(listItem);
            });
            userListContent.appendChild(userList);
        } else {
            const message = document.createElement('p');
            message.textContent = 'No users selected yet.';
            userListContent.appendChild(message);
        }
    }
}

// Sample user data (replace with your actual user data)
const users = [
    new User('User 1', 25, true, 'images/user1.jpg'),
    new User('User 2', 32, false, 'images/user2.jpg'),
    // ... more users
];

const userGrid = new UserGrid(users);
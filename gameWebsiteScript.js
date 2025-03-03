/* SLIDER */
let items = document.querySelectorAll('.slider .list .item');
let next = document.getElementById('next');
let prev = document.getElementById('prev');
let thumbnails = document.querySelectorAll('.thumbnail .item');

let countItem = items.length;
let itemActive = 0;

next.onclick = function() {
  itemActive = itemActive + 1;
  if (itemActive >= countItem) {
    itemActive = 0;
  }
  showSlider();
}

prev.onclick = function() {
  itemActive = itemActive - 1;
  if (itemActive < 0) {
    itemActive = countItem - 1;
  }
  showSlider();
}

let refreshInterval = setInterval(() => {
  next.click();
}, 3000)


function showSlider() {
  let itemActiveOld = document.querySelector('.slider .list .item.active');
  let thumbnailActiveOld = document.querySelector('.thumbnail .item.active');
  itemActiveOld.classList.remove('active');
  thumbnailActiveOld.classList.remove('active');

  items[itemActive].classList.add('active');
  thumbnails[itemActive].classList.add('active');

  clearInterval(refreshInterval);
  refreshInterval = setInterval(() => {
    next.click();
  }, 3000)
}

thumbnails.forEach((thumbnail, index) => {
  thumbnail.addEventListener('click', () => {
    itemActive = index;
    showSlider();
  })
})





let items2 = document.querySelectorAll('.cards .item2'); // Select all .item2 elements
let next2 = document.getElementById('next2');
let prev2 = document.getElementById('prev2');

let active = 3; // This is the index of the currently active item
function loadShow() {
  let stt = 0;
  items2[active].style.transform = `none`; // Use 120 to move items horizontally
  items2[active].style.zIndex = 1;
  items2[active].style.filter = `none`;
  items2[active].style.opacity = 1;
  for (let i = active + 1; i < items2.length; i++) {
    stt++;
    items2[i].style.transform = `translateX(${120 * stt}px) scale(${1 - 0.2 * stt}) perspective(16px) rotateY(-1deg)`; // Use 120 to move items horizontally
    items2[i].style.zIndex = -stt;
    items2[i].style.filter = 'blur(5px)';
    items2[i].style.opacity = stt > 2 ? 0 : 0.6;
  }
  stt = 0;
  for (var i = active - 1; i >= 0; i--) {
    stt++;
    items2[i].style.transform = `translateX(${-120 * stt}px) scale(${1 - 0.2 * stt}) perspective(16px) rotateY(1deg)`; // Use 120 to move items horizontally
    items2[i].style.zIndex = -stt;
    items2[i].style.filter = 'blur(5px)';
    items2[i].style.opacity = stt > 2 ? 0 : 0.6;
  }
}
loadShow();
next2.onclick = function() {
  active = active + 1 < items2.length ? active + 1 : active;
  loadShow();
}
prev2.onclick = function() {
  active = active - 1 >= 0 ? active - 1 : active;
  loadShow();
}
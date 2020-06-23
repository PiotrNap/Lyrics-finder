const form = document.getElementById('form'),
  input = document.getElementById('input'),
  submit = document.getElementById('submit'),
  list = document.getElementById('list'),
  resultHeaderBefore = document.getElementById('resultHeaderBefore'),
  resultHeaderAfter = document.getElementById('resultHeaderAfter'),
  nextIndex = document.getElementById('next-btn'),
  previousIndex = document.getElementById('previous-btn'),
  back = document.getElementById('back-btn'),
  noResults = document.getElementById('no-results'),
  results = document.getElementById('results'),
  lyrics = document.getElementById('lyrics'),
  nav = document.getElementById('nav-buttons'),
  loading = document.querySelector('.loading');

var searchValue = '';
var apiURL = 'https://api.lyrics.ovh';
var songsData = '';
var nextIndexPage = '';
var prevoiusIndexPage = '';

form.addEventListener('submit', (e) => {
  e.preventDefault();
});

input.addEventListener('change', (e) => {
  searchValue = e.target.value.trim().replace(/ /g, '%20');
});

submit.addEventListener('click', () => {
  fetchResults();
});

nextIndex.addEventListener('click', () => {
  var next = true;
  fetchPageIndex(next);
});

previousIndex.addEventListener('click', () => {
  var next = false;
  fetchPageIndex(next);
});

// fetch results based on input value
async function fetchResults() {
  try {
    var req = await fetch(apiURL + `/suggest/${searchValue}`);
    var res = await req.json();
    songsData = res;
  } catch (error) {
    console.log(error);
  }
  nextIndexPage = songsData.next;
  previousIndex.style.display = 'none';
  showResults();
}

// insert the song names and titles into the DOM list element
function showResults() {
  resultHeaderBefore.style.display = 'none';
  resultHeaderAfter.style.display = 'block';
  nav.style.display = 'flex';
  list.innerHTML = songsData.data
    .map(
      ({ artist, title }) =>
        `<li class="list-item">
        <p class="list-item--text">
            <span class="artist">${artist.name}</span> - ${title}
        </p>
        <button class="list-item--btn"
        data-artist="${artist.name}" data-title="${title}">Get the Lyrics</button>
    </li>`
    )
    .join('');
}

// get button listener for lyrics
results.addEventListener('click', (e) => {
  const elem = e.target;
  if (elem.tagName === 'BUTTON') {
    const artist = elem.getAttribute('data-artist');
    const title = elem.getAttribute('data-title');
    showLyrics(artist, title);
  }
});

// display the lyrics
async function showLyrics(artist, title) {
  const res = await fetch(`https://api.lyrics.ovh/v1/${artist}/${title}`);
  const data = await res.json();

  if (data.error) {
    list.innerHTML = data.error;
  } else {
    const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, '<br>');
    list.innerHTML = `
        <h2><span class="artist">${artist}</span> - ${title}</h2>
        <div class="song-text">
          <p>${lyrics}</p>
        </div>
      `;
  }
  nav.style.display = 'none';
  back.style.display = 'block';
}

// get page index +15/-15
async function fetchPageIndex(next) {
  var newURL = next === true ? nextIndexPage : previousIndexPage;
  loading.style.display = 'block';

  try {
    const fetchIndex = await fetch(
      `https://cors-anywhere.herokuapp.com/${newURL}`
    );
    const res = await fetchIndex.json();
    const newData = res;
    nextIndexPage = newData.next;
    if (!nextIndexPage) {
      nextIndex.style.display = 'none';
    } else {
      nextIndex.style.display = 'block';
    }

    previousIndexPage = newData.prev;
    if (!previousIndexPage) {
      previousIndex.style.display = 'none';
    } else {
      previousIndex.style.display = 'block';
    }

    list.innerHTML = newData.data
      .map(
        ({ artist, title }) =>
          `<li class="list-item">
        <p class="list-item--text">
            <span class="artist">${artist.name}</span> - ${title}
        </p>
        <button class="list-item--btn"
        data-artist="${artist.name}" data-title="${title}">Get the Lyrics</button>
    </li>`
      )
      .join('');
    loading.style.display = 'none';
  } catch (error) {
    loading.style.display = 'none';
    console.error(error);
  }
}

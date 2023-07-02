const form = document.querySelector("#search__form");
const result = document.querySelector("#result__list");
const word = document.querySelector("#result__word");
const phonetic = document.querySelector("#result__phonetic");
const meaning = document.querySelector("#result__meaning");
const example = document.querySelector("#result__example");
const errorWord = document.querySelector("#error__alert");
const errorSection = document.querySelector("#error__section");
const inputField = document.querySelectorAll("#search__form input");

const handleRequestError = () => {
  clearData();
  const query = form.elements.query.value;
  const errorAlert = `Unfortunately, "${query}" was not found in our dictionary. Please check your spelling and try again.`;
  errorWord.innerHTML = errorAlert;
  errorSection.classList.toggle("active", true);
};

const emptyInputError = () => {
  clearData();
  const errorAlert = "Please provide a word to browse our dictionary.";
  errorWord.innerHTML = errorAlert;
  errorSection.classList.toggle("active", true);
};

const injectInfoToDOM = (data) => {
  const apiWord = data[0].word;
  const apiPhonetics = data[0].phonetics;
  const apiMeanings = data[0].meanings;
  let apiPhonetic = '';

  if (apiPhonetics && apiPhonetics.length > 0) {
    for (let i = 0; i < apiPhonetics.length; i++) {
      if (apiPhonetics[i].text) {
        apiPhonetic = apiPhonetics[i].text;
        break;
      }
    }
  }

  if (apiWord) word.innerHTML = apiWord;
  if (apiPhonetic) phonetic.innerHTML = apiPhonetic;

  let definitionsCount = 0;
  const maxDefCount = 3; //changer ici pour le nombre de groupes de définitions que l'on veut afficher.

  apiMeanings.forEach((result) => {
    const apiPartOfSpeech = result.partOfSpeech;
    const apiDefinitions = result.definitions;

    if (definitionsCount < maxDefCount && apiDefinitions) {
      if (apiPartOfSpeech) {
        const apiSinglePOS = document.createElement("h4");
        apiSinglePOS.innerText = apiPartOfSpeech;
        meaning.appendChild(apiSinglePOS);
        apiSinglePOS.classList.add("poSpeech");
      }

      apiDefinitions.slice(0, maxDefCount - definitionsCount).forEach((definition) => {
        const apiSingleDef = document.createElement("li");
        const apiSingleExample = document.createElement("p");

        if (definition.definition) {
          apiSingleDef.innerText = definition.definition;
          meaning.appendChild(apiSingleDef);
          apiSingleDef.classList.add("resultDefinition");
        }

        if (definition.example) {
          apiSingleExample.innerText = definition.example;
          meaning.appendChild(apiSingleExample);
          apiSingleExample.classList.add("resultExample");
        }

        definitionsCount++;

        if (definitionsCount >= maxDefCount) {
          return;
        }
      });
    }
  });

  result.classList.toggle("active", true);
}

const getInfo = async (query, callback) => {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${query}`;
  try {
    const request = await fetch(url);
    if (!request.ok) {
      throw new Error(`${request.status}: ${request.statusText}`);
    }
    const json = await request.json();
    callback(json);
  } catch (error) {
    handleRequestError(error);
  }
};

const clearData = () => {
  word.innerHTML = '';
  phonetic.innerHTML = '';
  meaning.innerHTML = '';
  example.innerHTML = '';
  result.classList.toggle("active", false);
  if (handleRequestError) {
    errorAlert = ``;
    errorSection.classList.toggle("active", false);
  }
};



const submitForm = (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const query = formData.get("query");
  clearData();
  if (query) {
    getInfo(query, injectInfoToDOM);
  } else {
    emptyInputError();
  }
};

inputField.forEach((field) => { //Pour réinitialiser le formulaire avec le bouton "X" par défault du input[search] dans le html, ou quand on supprime tout le input utilisateur au clavier.
  field.addEventListener("input", (event) => {
    const value = event.target.value;
    if (!value) {
      clearData();
    }
  });
});

form.addEventListener("submit", submitForm);
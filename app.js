// DOM objects
const signInButton = document.querySelector('#login-out');
const revokeButton = document.querySelector('#revokeAccess');
// const alertMenu = document.querySelector('.alert');
const videoContainer = document.querySelector('.container-card');
const profilePicture = document.querySelector('.img-thumbnail');
const userStatsContainer = document.querySelector('.user-info');

// Client-Side Information
const client_id = '998400505735-v15ojonfpscdpcqc2llb1vts68gds3c6.apps.googleusercontent.com';
const client_secret = 'ZMSDHFOfC7fQXD1Leq8mkoq2';
const api_key = 'AIzaSyD9FNaxC-juqGCpeUKo8NPLN31OgAD601Q';
const SCOPE = 'https://www.googleapis.com/auth/youtube.readonly';
const discovery = 'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest';

let GoogleAuth; // Google Auth object.

function handleClientLoad() {
    // Load the API's client and auth2 modules.
    // Call the initClient function after the modules load.
    gapi.load('client:auth2', initClient);
};

function initClient() {
  gapi.client.init({
      'apiKey': api_key,
      'clientId': client_id,
      'scope': SCOPE,
      'discoveryDocs': [discovery]
  }).then(function () {
      GoogleAuth = gapi.auth2.getAuthInstance();

      // Listen for sign-in state changes.
      GoogleAuth.isSignedIn.listen(updateSigninStatus);
      setSigninStatus();

      signInButton.addEventListener('click', handleAuthClick);
      revokeButton.addEventListener('click', revokeAccess);
  });
}

let isAuthorized;
let currentApiRequest;

/**
 * Store the request details. Then check to determine whether the user
 * has authorized the application.
 *   - If the user has granted access, make the API request.
 *   - If the user has not granted access, initiate the sign-in flow.
 */
 function handleAuthClick() {
    if (GoogleAuth.isSignedIn.get()) {
      // User is authorized and has clicked "Sign out" button.
      GoogleAuth.signOut();
    } else {
      // User is not signed in. Start Google auth flow.
      GoogleAuth.signIn();
    }
  }

  function revokeAccess() {
    GoogleAuth.disconnect();
    emptyInfos();
  }

  function setSigninStatus() {
    let user = GoogleAuth.currentUser.get();
    let isAuthorized = user.hasGrantedScopes(SCOPE);
    if (isAuthorized) {
        signInButton.textContent = 'Sign out';

        revokeButton.style.display = 'inline-block';

        // alertMenu.innerHTML = `You are currently signed in and have granted access to this app.`;
        getChannelInfo();
    } else {
        signInButton.textContent = 'Sign In/Authorize';

        revokeButton.style.display = 'none';

        emptyInfos();
        
        // alertMenu.innerHTML = `You have not authorized this app or you are signed out.`;
    }
}

function updateSigninStatus() {
    setSigninStatus();
}

function getChannelInfo() {
    const request = gapi.client.request({
        'method': 'GET',
        'path': '/youtube/v3/channels',
        'params': {
            'part': 'snippet, contentDetails, statistics',
            'mine': 'true'
        }
    });
    // Execute the API request.
    request.execute(function(response) {
        console.log(response);

        const snippet = response['items'][0].snippet;
        const statistics = response['items'][0].statistics;
        const uploadsPlaylists = response.items[0].contentDetails.relatedPlaylists.uploads;

        showChannelStats(snippet,statistics);
        getChannelVideos(uploadsPlaylists);

        console.log(statistics);
        console.log(uploadsPlaylists);
    });
};

function getChannelVideos(uploadsPlaylistsId) {
    const responseParams = {
        "part": [
            'snippet, contentDetails'
        ],
        "maxResults": 10,
        "playlistId": uploadsPlaylistsId
    };

    const serverData = gapi.client.youtube.playlistItems.list(responseParams);

    serverData.execute(function(responseObject) {
        
        console.log(responseObject);
        displayVideosCards(responseObject.items);
    });
};

function showChannelStats(info, stats) {
    let channelData = "";
    const channelName = info.localized.title;
    const channelImage = info.thumbnails.high.url;
    const channelsubscribers = stats.subscriberCount;
    const channelTotalViews = stats.viewCount;
    const channelTotalVideos = stats.videoCount;

    profilePicture.src = channelImage;

    channelData = `
    <ul class="list-group">
        <li class="list-group-item d-flex justify-content-between align-items-center">
            Channel Name : <p> </p><span class="badge bg-secondary"> ${channelName}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center">
            Subscriber
        <span class="badge bg-danger rounded-pill">${channelsubscribers}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center">
            Total Views
        <span class="badge bg-danger rounded-pill">${channelTotalViews}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center">
            Total Vidoes
        <span class="badge bg-danger rounded-pill">${channelTotalVideos}</span>
        </li>
    </ul>
    `;
    document.querySelector('.container-md').style.display = 'block';
    document.querySelector('.container-empty').style.display = 'none';
    userStatsContainer.innerHTML = channelData;


}

function displayVideosCards(object) {
    let output = "";

    object.forEach(function(values) {
        output += `
        <div class="card" style="width: 18rem;">
            <img src="${values.snippet.thumbnails.high.url}" class="card-img-top" alt="Youtube Video Thumbnail">
            <div class="card-body">
                <h5 class="card-title">${values.snippet.title}</h5>
                <p class="card-text">${values.snippet.description.substring(0, 80)}</p>
                <a href="https://youtu.be/${values.snippet.resourceId.videoId}" class="btn btn-primary" target="_blank">Watch</a>
            </div>
        </div>
        `;
    });
    document.querySelector('.container-lg').style.display = 'block';
    videoContainer.innerHTML = output;
};

// Function Invoke when the user logs out
function emptyInfos() {
    document.querySelector('.container-md').style.display = 'none';
    document.querySelector('.container-lg').style.display = 'none';
}








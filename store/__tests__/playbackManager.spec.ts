import Vue, { VueConstructor } from 'vue';
import { createLocalVue } from '@vue/test-utils';
import Vuex, { Store } from 'vuex';
import { cloneDeep } from 'lodash';
import {
  BaseItemDto,
  MediaSourceInfo,
  MediaSourceType
} from '@jellyfin/client-axios';
import {
  state,
  mutations,
  actions,
  PlaybackManagerState,
  PlaybackStatus
} from '../playbackManager';

const PLAYBACK_STORE_CLEAR_TEST_VALUE = {
  status: PlaybackStatus.stopped,
  lastItemIndex: null,
  currentItemIndex: null,
  currentMediaSource: null,
  currentVideoStreamIndex: 0,
  currentAudioStreamIndex: 0,
  currentSubtitleStreamIndex: 0,
  currentItemChapters: null,
  currentTime: null,
  lastProgressUpdate: 0,
  currentVolume: 100,
  isFullscreen: false,
  isMuted: false,
  isShuffling: false,
  isMinimized: true,
  repeatMode: null,
  queue: [],
  playSessionId: null
};

const DEMO_TEST_ITEM_A = {
  Name: 'demo item 1',
  Id: 'demo-item-1'
} as BaseItemDto;

const DEMO_TEST_ITEM_B = {
  Name: 'demo item 2',
  Id: 'demo-item-2'
} as BaseItemDto;

const DEMO_TEST_ITEM_C = {
  Name: 'demo item 3',
  Id: 'demo-item-3'
} as BaseItemDto;

const DEMO_TEST_MEDIA_SOURCE = {
  duration: 500,
  Id: 'demo-media-source-id',
  Type: MediaSourceType.Default
} as MediaSourceInfo;

let localVue: VueConstructor<Vue>;
let store: Store<PlaybackManagerState>;

beforeEach(() => {
  localVue = createLocalVue();
  localVue.use(Vuex);

  store = new Vuex.Store(cloneDeep({ state, mutations, actions }));
});

test('When "SET_QUEUE" is committed, que is set.', () => {
  store.replaceState({ ...PLAYBACK_STORE_CLEAR_TEST_VALUE });

  store.commit('SET_QUEUE', {
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE,
    queue: [DEMO_TEST_ITEM_A, DEMO_TEST_ITEM_B, DEMO_TEST_ITEM_C]
  });

  expect(store.state.queue).toMatchObject([
    DEMO_TEST_ITEM_A,
    DEMO_TEST_ITEM_B,
    DEMO_TEST_ITEM_C
  ]);
});

test('When "ADD_TO_QUEUE" is committed, the list of items is added to the queue. Case A', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE
  });

  store.commit('ADD_TO_QUEUE', {
    queue: [DEMO_TEST_ITEM_B, DEMO_TEST_ITEM_A]
  });

  expect(store.state.queue).toMatchObject([DEMO_TEST_ITEM_B, DEMO_TEST_ITEM_A]);
});

test('When "ADD_TO_QUEUE" is committed, the list of items is added to the queue. Case B', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE,
    queue: [DEMO_TEST_ITEM_A, DEMO_TEST_ITEM_B]
  });

  store.commit('ADD_TO_QUEUE', {
    queue: [DEMO_TEST_ITEM_B]
  });

  expect(store.state.queue).toMatchObject([
    DEMO_TEST_ITEM_A,
    DEMO_TEST_ITEM_B,
    DEMO_TEST_ITEM_B
  ]);
});

test('When "CLEAR_QUEUE" is committed, queue is cleared.', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE,
    queue: [DEMO_TEST_ITEM_A, DEMO_TEST_ITEM_B]
  });

  store.commit('CLEAR_QUEUE');

  expect(store.state.queue).toMatchObject([]);
});

test('When "SET_CURRENT_ITEM_INDEX" is committed, queue is cleared.', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE,
    queue: [
      DEMO_TEST_ITEM_A,
      DEMO_TEST_ITEM_B,
      DEMO_TEST_ITEM_C,
      DEMO_TEST_ITEM_A
    ],
    currentItemIndex: 3
  });

  store.commit('SET_CURRENT_ITEM_INDEX', { currentItemIndex: 5 });

  expect(store.state.lastItemIndex).toBe(3);
  expect(store.state.currentItemIndex).toBe(5);
});

test('When "SET_CURRENT_MEDIA_SOURCE" is committed, queue is cleared.', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE
  });

  store.commit('SET_CURRENT_MEDIA_SOURCE', {
    mediaSource: DEMO_TEST_MEDIA_SOURCE
  });

  expect(store.state.currentMediaSource).toMatchObject(DEMO_TEST_MEDIA_SOURCE);
});

test('When "INCREASE_QUEUE_INDEX" is committed, currentItemIndex is increased. Case A', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE
  });

  store.commit('INCREASE_QUEUE_INDEX');

  expect(store.state.currentItemIndex).toBeNull();
});

test('When "INCREASE_QUEUE_INDEX" is committed, currentItemIndex is increased. Case B', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE,
    currentItemIndex: 1,
    lastItemIndex: 0
  });

  store.commit('INCREASE_QUEUE_INDEX');

  expect(store.state.currentItemIndex).toBe(2);
  expect(store.state.lastItemIndex).toBe(1);
});

test('When "DECREASE_QUEUE_INDEX" is committed, currentItemIndex is decreased. Case A', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE
  });

  store.commit('DECREASE_QUEUE_INDEX');

  expect(store.state.currentItemIndex).toBeNull();
});

test('When "DECREASE_QUEUE_INDEX" is committed, currentItemIndex is decreased. Case B', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE,
    currentItemIndex: 2
  });

  store.commit('DECREASE_QUEUE_INDEX');

  expect(store.state.currentItemIndex).toBe(1);
});

test('When "START_PLAYBACK" is committed, status is set to playing.', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE
  });

  store.commit('START_PLAYBACK');

  expect(store.state.status).toBe(PlaybackStatus.playing);
});

test('When "UNPAUSE_PLAYBACK" is committed, status is set to playing.', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE
  });

  store.commit('UNPAUSE_PLAYBACK');

  expect(store.state.status).toBe(PlaybackStatus.playing);
});

test('When "PAUSE_PLAYBACK" is committed, status is set to playing.', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE,
    status: PlaybackStatus.playing
  });

  store.commit('PAUSE_PLAYBACK');

  expect(store.state.status).toBe(PlaybackStatus.paused);
});

// STOP_PLAYBACK

// RESET_LAST_ITEM_INDEX

// SET_LAST_ITEM_INDEX

// SET_LAST_PROGRESS_UPDATE

test('When "SET_VOLUME" is committed, status is set to playing.', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE
  });

  store.commit('SET_VOLUME', { volume: 10 });

  expect(store.state.currentVolume).toBe(10);
});

test('When "SET_MINIMIZE" is committed, isMinimized is set. Case A', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE,
    isMinimized: false
  });

  store.commit('SET_MINIMIZE', { minimized: true });

  expect(store.state.isMinimized).toBe(true);
});

test('When "SET_MINIMIZE" is committed, isMinimized is set. Case B', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE,
    isMinimized: true
  });

  store.commit('SET_MINIMIZE', { minimized: false });

  expect(store.state.isMinimized).toBe(false);
});

test('When "SET_CURRENT_TIME" is committed, currentTime is set.', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE
  });

  store.commit('SET_CURRENT_TIME', { time: 1.234 });

  expect(store.state.currentTime).toBe(1.234);
});

test('When "CHANGE_CURRENT_TIME" is committed, currentTime is set.', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE
  });

  store.commit('CHANGE_CURRENT_TIME', { time: 1.234 });

  expect(store.state.currentTime).toBe(1.234);
});

test('When "RESET_CURRENT_TIME" is committed, currentTime is set to 0.', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE,
    currentTime: 1.234
  });

  store.commit('RESET_CURRENT_TIME');

  expect(store.state.currentTime).toBe(0);
});

test('When "TOGGLE_MINIMIZE" is committed, currentTime is set.', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE,
    isMinimized: false
  });

  store.commit('TOGGLE_MINIMIZE');

  expect(store.state.isMinimized).toBe(true);

  store.commit('TOGGLE_MINIMIZE');

  expect(store.state.isMinimized).toBe(false);
});

test('When "SET_PLAY_SESSION_ID" is is called, the playSessionId is set.', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE
  });

  store.commit('SET_PLAY_SESSION_ID', { id: 'demo-play-session-id' });

  expect(store.state.playSessionId).toBe('demo-play-session-id');
});

// dispatching play is untestable since it uses translateItemForPlayback

test('When stop is is called, status is set to stopped.', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE,
    status: PlaybackStatus.playing
  });

  store.dispatch('stop');

  expect(store.state.status).toBe(PlaybackStatus.stopped);
});

test('When pause is is called, status is set to paused.', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE,
    status: PlaybackStatus.playing
  });

  store.dispatch('pause');

  expect(store.state.status).toBe(PlaybackStatus.paused);
});

test('When pause is is called, status is set to playing.', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE,
    status: PlaybackStatus.paused
  });

  store.dispatch('unpause');

  expect(store.state.status).toBe(PlaybackStatus.playing);
});

test('When clearQueue is is called, the queue is cleared', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE,
    queue: [DEMO_TEST_ITEM_A, DEMO_TEST_ITEM_B]
  });

  store.dispatch('clearQueue');

  expect(store.state.queue).toMatchObject([]);
});

test('When setMediaSource is is called, the correct media source is set.', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE
  });

  store.dispatch('setMediaSource', { mediaSource: DEMO_TEST_MEDIA_SOURCE });

  expect(store.state.currentMediaSource).toMatchObject(DEMO_TEST_MEDIA_SOURCE);
});

test('When setNextTrack is is called, the queue is cleared. Case A', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE,
    queue: [DEMO_TEST_ITEM_A, DEMO_TEST_ITEM_B],
    status: PlaybackStatus.playing,
    currentItemIndex: 1
  });

  store.dispatch('setNextTrack');

  expect(store.state.status).toBe(PlaybackStatus.stopped);
});

test('When setNextTrack is is called, the queue is cleared. Case B', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE,
    queue: [DEMO_TEST_ITEM_A, DEMO_TEST_ITEM_B],
    currentItemIndex: 0
  });

  store.dispatch('setNextTrack');

  expect(store.state.currentItemIndex).toBe(1);
  expect(store.state.lastItemIndex).toBe(0);
});

test('When setPreviousTrack is is called, the queue is cleared. Case A', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE,
    currentTime: 5
  });

  store.dispatch('setPreviousTrack');

  expect(store.state.currentTime).toBe(0);
});

test('When setPreviousTrack is is called, the queue is cleared. Case B', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE,
    currentTime: 1,
    currentItemIndex: 3
  });

  store.dispatch('setPreviousTrack');

  expect(store.state.currentItemIndex).toBe(2);
});

test('When setPreviousTrack is is called, the queue is cleared. Case C', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE,
    currentTime: 1
  });

  store.dispatch('setPreviousTrack');

  expect(store.state.currentTime).toBe(0);
});

test('When resetCurrentItemIndex is is called, the currentItemIndex is set to null.', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE,
    currentItemIndex: 1
  });

  store.dispatch('resetCurrentItemIndex');

  expect(store.state.currentItemIndex).toBe(null);
});

test('When setLastItemIndex is is called, the lastItemIndex is set to null.', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE,
    lastItemIndex: 1,
    currentItemIndex: 2
  });

  store.dispatch('setLastItemIndex');

  expect(store.state.lastItemIndex).toBe(2);
});

test('When resetLastItemIndex is is called, the lastItemIndex is set to null.', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE,
    lastItemIndex: 1
  });

  store.dispatch('resetLastItemIndex');

  expect(store.state.lastItemIndex).toBe(null);
});

test('When setLastProgressUpdate is is called, the state is updated.', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE
  });

  store.dispatch('setLastProgressUpdate', { progress: 10 });

  expect(store.state.lastProgressUpdate).toBe(10);
});

test('When setVolume is is called, the volumeLevel is updated.', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE
  });

  store.dispatch('setVolume', { volume: 10 });

  expect(store.state.currentVolume).toBe(10);
});

test('When setCurrentTime is is called, the currentTime is updated.', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE
  });

  store.dispatch('setCurrentTime', { time: 12.345 });

  expect(store.state.currentTime).toBe(12.345);
});

test('When changeCurrentTime is is called, the currentTime is updated.', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE
  });

  store.dispatch('changeCurrentTime', { time: 12.345 });

  expect(store.state.currentTime).toBe(12.345);
});

test('When setMinimized is is called, isMinimized is updated.', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE,
    isMinimized: false
  });

  store.dispatch('setMinimized', { minimized: true });

  expect(store.state.isMinimized).toBe(true);
});

test('When toggleMinimized is is called, isMinimized is toggled between.', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE,
    isMinimized: false
  });

  store.dispatch('toggleMinimized');

  expect(store.state.isMinimized).toBe(true);

  store.dispatch('toggleMinimized');

  expect(store.state.isMinimized).toBe(false);
});

test('When setPlaySessionId is is called, the playSessionId is set.', () => {
  store.replaceState({
    ...PLAYBACK_STORE_CLEAR_TEST_VALUE
  });

  store.dispatch('setPlaySessionId', { id: 'demo-play-session-id' });

  expect(store.state.playSessionId).toBe('demo-play-session-id');
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Modal } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const AudioRecorder = () => {
  const [recording, setRecording] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  
  // Modal state for playback
  const [playModalVisible, setPlayModalVisible] = useState(false);
  const [currentSound, setCurrentSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  // Modal state for saving recording name
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [recordingName, setRecordingName] = useState('');
  const [tempRecording, setTempRecording] = useState(null);

  async function startRecording() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTION_PRESET_HIGH_QUALITY
        );
        setRecording(recording);
        setRecordingDuration(0);
        const id = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);
        setIntervalId(id);
      }
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }

  async function stopRecording() {
    if (!recording) return;
    clearInterval(intervalId);
    setIntervalId(null);
    try {
      await recording.stopAndUnloadAsync();
      const recordingStatus = await recording.getStatusAsync();
      const durationMillis = recordingStatus?.durationMillis || 0;
      const { sound } = await recording.createNewLoadedSoundAsync();
      
      // Save temporary recording to be named
      setTempRecording({
        sound,
        duration: formatDuration(durationMillis),
        date: new Date().toLocaleString(),
      });

      // Show the modal to name the recording
      setNameModalVisible(true);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    } finally {
      setRecording(null);
    }
  }

  const formatDuration = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 1000 / 60);
    const seconds = Math.round((milliseconds / 1000) % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const saveRecordingName = () => {
    const newRecording = {
      id: new Date().getTime(),
      sound: tempRecording.sound,
      name: recordingName,
      duration: tempRecording.duration,
      date: tempRecording.date,
    };

    setRecordings((prev) => [...prev, newRecording]);
    setNameModalVisible(false);
    setRecordingName('');
  };

  const openPlayModal = async (recording) => {
    setPlayModalVisible(true);
    const status = await recording.sound.getStatusAsync();
    setCurrentSound(recording.sound);
    setPlaybackTime(status.positionMillis || 0);
    setPlaybackDuration(status.durationMillis || 0);
    recording.sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        setPlaybackTime(status.positionMillis);
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      }
    });
  };

  const togglePlayPause = async () => {
    if (!currentSound) return;
    if (isPlaying) {
      await currentSound.pauseAsync();
      setIsPlaying(false);
    } else {
      await currentSound.playAsync();
      setIsPlaying(true);
    }
  };

  const seekPlayback = async (offset) => {
    if (!currentSound) return;
    const status = await currentSound.getStatusAsync();
    const newTime = Math.min(
      Math.max(0, status.positionMillis + offset),
      status.durationMillis
    );
    await currentSound.setPositionAsync(newTime);
    setPlaybackTime(newTime);
  };

  const closePlayModal = () => {
    setPlayModalVisible(false);
    if (currentSound) {
      currentSound.stopAsync();
    }
    setIsPlaying(false);
  };

  const filteredRecordings = recordings.filter((rec) =>
    rec.name.toLowerCase().includes(searchText.toLowerCase()) ||
    rec.date.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Voice Notes</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search voice notes"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Recording Button */}
      <View style={styles.recordingSection}>
        {recording && (
          <Text style={styles.timerText}>
            {formatDuration(recordingDuration * 1000)}
          </Text>
        )}
        <TouchableOpacity
          style={recording ? styles.stopButton : styles.recordButton}
          onPress={recording ? stopRecording : startRecording}
        >
          <MaterialIcons
            name={recording ? 'stop' : 'mic'}
            size={28}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* Recordings List */}
      <FlatList
        data={filteredRecordings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.recordingItem}>
            <View style={styles.recordingDetails}>
              <Text style={styles.recordingText}>Name: {item.name}</Text>
              <Text style={styles.recordingText}>Duration: {item.duration}</Text>
              <Text style={styles.recordingDate}>Date: {item.date}</Text>
            </View>
            <View style={styles.recordingActions}>
              <TouchableOpacity onPress={() => openPlayModal(item)}>
                <Ionicons name="play-circle" size={30} color="#4caf50" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  setRecordings((prev) =>
                    prev.filter((rec) => rec.id !== item.id)
                  )
                }
              >
                <Ionicons name="trash" size={30} color="#f44336" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Name Modal */}
      <Modal
        transparent={true}
        visible={nameModalVisible}
        animationType="slide"
        onRequestClose={() => setNameModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Save Recording</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter name for the recording"
              value={recordingName}
              onChangeText={setRecordingName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={saveRecordingName}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setNameModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Play Modal */}
      <Modal
        transparent={true}
        visible={playModalVisible}
        animationType="slide"
        onRequestClose={closePlayModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Ionicons
              name="close-circle"
              size={30}
              color="#f44336"
              onPress={closePlayModal}
            />
            <Text style={styles.modalHeader}>Audio Playback</Text>
            <Text style={styles.timerText}>
              {formatDuration(playbackTime)} / {formatDuration(playbackDuration)}
            </Text>
            <View style={styles.playbackControls}>
              <TouchableOpacity onPress={() => seekPlayback(-10000)}>
                <Ionicons name="play-back" size={40} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity onPress={togglePlayPause}>
                <Ionicons
                  name={isPlaying ? 'pause-circle' : 'play-circle'}
                  size={60}
                  color="#000"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => seekPlayback(10000)}>
                <Ionicons name="play-forward" size={40} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
  },
  recordingSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  recordButton: {
    backgroundColor: '#f46625',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#f44336',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#f44336',
  },
  recordingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  recordingDetails: {
    flex: 1,
  },
  recordingText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  recordingDate: {
    fontSize: 14,
    color: '#999',
  },
  recordingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#f46625',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#999',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#f46625',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#999',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});


export default AudioRecorder;

import { View, Text, StyleSheet, Button } from 'react-native'
import React from 'react'
import { Audio } from 'expo-av'

const HomeScreen = () => {
    const [recording, setRecording] = React.useState();
    const [recordings, setRecordings] = React.useState([]);

    async function startRecording() {
        try{
            const perm = await Audio.requestPermissionsAsync();
            if (perm.status === 'granted') {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true
                });
                const { recording } = await Audio.Recording.createAsync(Audio.RECORDING_OPTION_PRESET_HIGH_QUALITY)
                setRecording(recording);
            }
        } catch (err) {}
    }
    async function stopRecording() {
        setRecording(undefined);

        await recording.stopAndUnloadAsync();
        let allRecordings = [...recordings]
        const { sound, status } = await recording.createNewLoadedSoundAsync();
        allRecordings.push({
            sound: sound,
            duration: getDurationFormatted(status.durationMillis),
            file: recording.getURI()
        });

        setRecordings(allRecordings);
    }

    async function getDurationFormatted(milleseconds) {
        const minutes = milleseconds / 1000 / 60;
        const seconds = Math.round((minutes - Math.floor(minutes)) * 60);
        return seconds < 10 ? `${Math.floor(minutes)}:0${seconds}` : `${Math.floor(minutes)}:${seconds}`
    }
    async function getRecordingLines() {
        return recordings.map((recordingLine, index) =>{
            return (
                <View key={index} style={StyleSheet.row}>
                    <Text style={styles.fill}>
                        Recording #{index + 1} | {recordingLine.duration}
                    </Text>
                    <Button onPress={() => recordingLine.sound.replayAsync} />
                </View>
            )
        })
    }
    async function clearRecordings() {}

  return (
    <View>
      <Button title={recording ? 'Stop Recording' : 'Start Recording'} onPress={recording ? stopRecording : startRecording} />
      {getRecordingLines()}
      <Button title={recordings.length > 0 ? 'Clear Recordings' : ''} onPress={clearRecordings} />
    </View>
  )
}

export default HomeScreen
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ElevenLabs API 키와 음성 ID
const API_KEY = process.env.ELEVENLABS_API_KEY;
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

// 감정에 따른 음성 파라미터 조정
const emotionSettings = {
  // 기본 설정
  neutral: {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0,
    use_speaker_boost: true
  },
  // 기쁨 - 높은 피치, 빠른 속도
  happy: {
    stability: 0.3,
    similarity_boost: 0.7,
    style: 0.3,
    use_speaker_boost: true
  },
  // 슬픔 - 낮은 피치, 느린 속도
  sad: {
    stability: 0.7,
    similarity_boost: 0.8,
    style: 0.2,
    use_speaker_boost: true
  },
  // 화남 - 높은 강도, 약간 거친 음성
  angry: {
    stability: 0.3,
    similarity_boost: 0.5,
    style: 0.4,
    use_speaker_boost: true
  },
  // 놀람 - 높은 피치, 약간 빠른 속도
  surprised: {
    stability: 0.4,
    similarity_boost: 0.6,
    style: 0.3,
    use_speaker_boost: true
  }
};

/**
 * 텍스트를 음성으로 변환하는 함수
 * @param {string} text - 음성으로 변환할 텍스트
 * @param {string} emotion - 감정 타입 (neutral, happy, sad, angry, surprised)
 * @param {number} intensity - 감정 강도 (0.0 ~ 1.0)
 * @returns {Promise<Buffer>} - 오디오 데이터
 */
async function textToSpeech(text, emotion = 'neutral', intensity = 0.5) {
  try {
    // 감정이 유효한지 확인
    const validEmotion = emotionSettings[emotion] ? emotion : 'neutral';
    
    // 기본 설정 가져오기
    const voiceSettings = { ...emotionSettings[validEmotion] };
    
    // 감정 강도에 따라 파라미터 조정
    if (intensity > 0) {
      // 강도에 따라 파라미터 스케일링
      if (validEmotion === 'happy' || validEmotion === 'angry' || validEmotion === 'surprised') {
        voiceSettings.stability = Math.max(0.1, voiceSettings.stability - (intensity * 0.2));
        voiceSettings.style = Math.min(1.0, voiceSettings.style + (intensity * 0.3));
      } else if (validEmotion === 'sad') {
        voiceSettings.stability = Math.min(0.9, voiceSettings.stability + (intensity * 0.2));
        voiceSettings.style = Math.min(1.0, voiceSettings.style + (intensity * 0.2));
      }
    }

    // ElevenLabs API 호출
    const response = await axios({
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_VOICE_ID}`,
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': API_KEY
      },
      data: {
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: voiceSettings
      },
      responseType: 'arraybuffer'
    });

    return response.data;
  } catch (error) {
    console.error('TTS API 호출 중 오류 발생:', error.message);
    throw new Error('음성 생성에 실패했습니다.');
  }
}

/**
 * 생성된 오디오를 파일로 저장
 * @param {Buffer} audioData - 오디오 데이터
 * @param {string} filename - 저장할 파일 이름
 * @returns {string} - 저장된 파일 경로
 */
function saveAudioFile(audioData, filename = 'output.mp3') {
  const outputDir = path.join(__dirname, '../public/audio');
  
  // 디렉토리가 없으면 생성
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, audioData);
  
  return filePath;
}

module.exports = {
  textToSpeech,
  saveAudioFile
}; 
const express = require('express');
const router = express.Router();
const { textToSpeech, saveAudioFile } = require('./ttsService');
const path = require('path');

// TTS API 엔드포인트
router.post('/api/tts', async (req, res) => {
  try {
    const { text, emotion = 'neutral', intensity = 0.5 } = req.body;
    
    // 필수 파라미터 검증
    if (!text) {
      return res.status(400).json({ error: '텍스트가 필요합니다.' });
    }
    
    // 텍스트를 음성으로 변환
    const audioData = await textToSpeech(text, emotion, intensity);
    
    // 고유한 파일 이름 생성
    const timestamp = new Date().getTime();
    const filename = `tts_${timestamp}.mp3`;
    
    // 파일로 저장
    const filePath = saveAudioFile(audioData, filename);
    
    // 파일 URL 생성
    const fileUrl = `/audio/${filename}`;
    
    // 응답 반환
    res.json({
      success: true,
      audio_url: fileUrl,
      text,
      emotion,
      intensity
    });
  } catch (error) {
    console.error('TTS 처리 중 오류 발생:', error);
    res.status(500).json({ error: '음성 생성에 실패했습니다.' });
  }
});

// 음성 스트리밍 엔드포인트
router.post('/api/tts-stream', async (req, res) => {
  try {
    const { text, emotion = 'neutral', intensity = 0.5 } = req.body;
    
    // 필수 파라미터 검증
    if (!text) {
      return res.status(400).json({ error: '텍스트가 필요합니다.' });
    }
    
    // 텍스트를 음성으로 변환
    const audioData = await textToSpeech(text, emotion, intensity);
    
    // 스트리밍 응답 설정
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioData.length
    });
    
    // 오디오 데이터 직접 전송
    res.send(audioData);
  } catch (error) {
    console.error('TTS 스트리밍 중 오류 발생:', error);
    res.status(500).json({ error: '음성 생성에 실패했습니다.' });
  }
});

// 채팅봇 메시지 처리 엔드포인트
router.post('/api/chat-tts', async (req, res) => {
  try {
    const { message, emotion = 'neutral', intensity = 0.5 } = req.body;
    
    // 필수 파라미터 검증
    if (!message) {
      return res.status(400).json({ error: '메시지가 필요합니다.' });
    }
    
    // 텍스트를 음성으로 변환
    const audioData = await textToSpeech(message, emotion, intensity);
    
    // 고유한 파일 이름 생성
    const timestamp = new Date().getTime();
    const filename = `chat_${timestamp}.mp3`;
    
    // 파일로 저장
    const filePath = saveAudioFile(audioData, filename);
    
    // 파일 URL 생성
    const fileUrl = `/audio/${filename}`;
    
    // 응답 반환
    res.json({
      success: true,
      audio_url: fileUrl,
      message,
      emotion,
      intensity
    });
  } catch (error) {
    console.error('채팅 TTS 처리 중 오류 발생:', error);
    res.status(500).json({ error: '음성 생성에 실패했습니다.' });
  }
});

module.exports = router; 
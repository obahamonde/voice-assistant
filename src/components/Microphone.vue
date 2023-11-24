<script setup lang="ts">


import { useSpeechRecognition, useFetch } from "@vueuse/core";
import { ref } from "vue";

import { Icon } from "@iconify/vue";
type Message = {
  content: string;
  role: string;
};
const messagesExchanged = ref<Message[]>([]);
const loading = ref(false);

const useSpeech = (language: string) => {
  // Setup the speech recognition instance
  const speech = useSpeechRecognition({
    lang: language,
    continuous: true,
  });
   

  // Setup the speech recognition grammar
  const SpeechGrammarList =
    // @ts-ignore
    window.SpeechGrammarList || window.webkitSpeechGrammarList;
  const speechRecognitionList = new SpeechGrammarList();
  speechRecognitionList.addFromString(1);
  speech.recognition!.grammars = speechRecognitionList;

  const { isListening, result } = speech;
 
  const fetchAudio = async (text: string) => {
    try {
      loading.value = true;
      const { data: textData } = await useFetch(`/api/chat?text=${text}`).text();
      messagesExchanged.value.push({content:text,role:'user'})
      if (!textData.value) return;
      const modelOutput = textData.value;
      const { data } = await useFetch(`/api/audio?text=${modelOutput}`, {
        method: "GET",
      }).blob();
      if (!data.value) return;
      const blobAudio = new Blob([data.value], { type: "audio/opus" });
      const audioUrl = URL.createObjectURL(blobAudio);
      loading.value = false;
      const audio = new Audio(audioUrl);
      audio.play();
      messagesExchanged.value.push({content:"",role:'assistant'})
      for (let i = 0; i < modelOutput.length; i++) {
        const char = modelOutput[i];
        messagesExchanged.value[messagesExchanged.value.length-1].content+=char;
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {
    isListening,
    result,
    speech,
    fetchAudio,
  };
};

const { speech, isListening, result, fetchAudio } = useSpeech("es-MX");
const handleSpeech = async () => {
  if (isListening.value) {
    speech.stop();
    await fetchAudio(result.value);
    result.value = "";
  } else {
    speech.start();
  }
};
</script>
<template>
  <section class="container-center card">  
    <button class="toolbar-btn cp" >
    <Icon
      
      :icon="isListening ? 'mdi-microphone-off' : 'mdi-microphone'"
      @click="handleSpeech()"
      class="toolbar-icon"
    />
    
  </button>
  <div v-if="loading"><Icon  icon="mdi-loading" class="toolbar-icon animate-spin" /></div>
    <div v-for="message in messagesExchanged"  class="box card">
    <img :src="message.role=='user' ? '/user.png' : '/assistant.png'" width="50px" height="50px" class="avatar-rounded-full" />
    <div class="message-box">{{message.content}}</div>
  </div>
  
  </section>

</template>
<style scoped>
.toolbar-btn {
  background-color: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 0;
  margin: 0.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 300px;
  height: 300px;
  transition: all 0.2s ease-in-out;
}
.toolbar-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}
.box {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0.2rem;
  padding: 0.2rem;
  border-radius: 10px;
  background-color: #fff;
  color: #000;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  max-width: 1200px;
  
  word-wrap: break-word;
}



.container-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 32rem;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.toolbar-icon {
  font-size: 8em;
  color: #ddd;
}
.toolbar-icon:hover {
  color: #fff;
  transform: scale(1.1);
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.avatar-rounded-full {
  border-radius: 50%;
  width: 50px;
  height: 50px;
  margin: 1rem;
}

.message-box {
  background-color: #fff;
  color: #000;
  border-radius: 10px;
  padding: 1rem;
  margin: 1rem;
  width: 36rem;
  word-wrap: break-word;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}



.cp {
  cursor: pointer;
}

.toolbar-btn:active {
  transform: scale(0.9);
}

.toolbar-btn:focus {
  outline: none;
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-btn:disabled:hover {
  background-color: transparent;
}

.toolbar-btn:disabled .toolbar-icon {
  color: #fff;
}

.toolbar-btn:disabled:hover .toolbar-icon {
  color: #fff;
}

.toolbar-btn:disabled:active {
  transform: scale(1);
}

</style>

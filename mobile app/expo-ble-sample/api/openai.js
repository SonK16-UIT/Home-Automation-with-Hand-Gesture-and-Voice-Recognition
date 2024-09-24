import { useAuth } from "../context/authContext";
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyA6h-7UeNe-0pdwTstRyOlRWDshnVUolzc");

// Mapping number words to their respective integer strings
const numberWordsMap = {
  'one': '1',
  'two': '2',
  'three': '3',
  'four': '4',
  'five': '5',
  'six': '6',
  'seven': '7',
  'eight': '8',
  'nine': '9',
  'zero': '0'
};

// Utility function to replace word numbers with their corresponding integers
const replaceNumberWordsWithIntegers = (input) => {
  let words = input.split(' ');
  let replacedWords = words.map(word => numberWordsMap[word] ? numberWordsMap[word] : word);
  return replacedWords.join(' ');
};

// Function to handle device control (turn on/off)
const handleDeviceControl = async (temp, messages, getRaspDataByUserId, GetDeviceData, updateStatus, user) => {
  const action = temp.includes('turn on') ? 'ON' : 'OFF';
  const filtered_prompt = temp.replace("turn on", "").replace("turn off", "").trim();

  if (!filtered_prompt) {
    const assistantMessage = `Please specify which device you'd like to ${action.toLowerCase()}. For example: 'turn on the living room light'`;
    messages.push({ role: 'assistant', content: assistantMessage });
    return { success: false, messages };
  }

  const rooms = await getRaspDataByUserId(user.uid);
  if (rooms && rooms.data) {
    for (let room of rooms.data) {
      const devices = await GetDeviceData(room.id);
      if (devices && devices.data && devices.data.length) {
        for (let device of devices.data) {
          if (device.device_name.toLowerCase() === filtered_prompt && device.type === 'toggle') {
            if (device.status !== action) {
              await updateStatus(device.id, action);
              const assistantMessage = `${device.device_name} turned ${action.toLowerCase()}`;
              messages.push({ role: 'assistant', content: assistantMessage });
              return { success: true, messages };
            } else {
              const assistantMessage = `${device.device_name} is already ${action.toLowerCase()}`;
              messages.push({ role: 'assistant', content: assistantMessage });
              return { success: true, messages };
            }
          }
        }
      }
    }
  }

  const errorMessage = `Device '${filtered_prompt}' not found.`;
  messages.push({ role: 'assistant', content: errorMessage });
  return { success: false, messages };
};

// Function to handle image retrieval (latest/oldest)
const handleImageRetrieval = async (temp, messages, getRaspDataByUserId, GetDeviceData, GetMotionPictures, user) => {
  const action = temp.includes('latest') ? 'latest' : 'oldest';
  const filtered_prompt = temp.replace("show me", "").replace("picture", "").replace("image", "").replace("latest", "").replace("oldest", "").replace("the", "").replace("of", "").trim();

  if (!filtered_prompt) {
    const assistantMessage = `Please specify which device you'd like to ${action.toLowerCase()}. For example: 'show me the latest picture of MOTION 1'`;
    messages.push({ role: 'assistant', content: assistantMessage });
    return { success: false, messages };
  }

  const rooms = await getRaspDataByUserId(user.uid);
  if (rooms && rooms.data) {
    for (let room of rooms.data) {
      const devices = await GetDeviceData(room.id);
      if (devices && devices.data && devices.data.length) {
        for (let device of devices.data) {
          if (device.device_name.toLowerCase() === filtered_prompt && device.type === 'toggle') {
            const response = await GetMotionPictures(user.uid, device.id);
            const images = response.pictures    
            if (images) {
                const image = action === 'latest' ? images[images.length - 1] : images[0];
                const assistantMessage = `${action} picture on ${device.device_name}: ${image.formattedTimestamp}`;

                // Ensure the image URL is included correctly in the message object
                messages.push({
                    role: 'assistant',
                    content: assistantMessage,
                    image: { url: image.url }  // Assign image URL correctly
                });
        
                return { success: true, messages };
            }
        }
        }
      }
    }
  }

  const errorMessage = `Device '${filtered_prompt}' not found.`;
  messages.push({ role: 'assistant', content: errorMessage });
  return { success: false, messages };
};

// Function to handle AI prompt
const handleAIPrompt = async (prompt, messages) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`${prompt} answer as a home assistant and make it short`);
    const response = await result.response;
    const text = response.text();

    messages.push({ role: 'assistant', content: text });
    return { success: true, messages };
  } catch (err) {
    console.log('Error during API call:', err);
    return { success: false, msg: err.message };
  }
};

// Main API call function
export const apiCall = async (prompt, messages, { getRaspDataByUserId, GetDeviceData, updateStatus, user, GetMotionPictures }) => {
  let temp = prompt.toLowerCase();
  temp = replaceNumberWordsWithIntegers(temp);

  if (temp.includes('turn on') || temp.includes('turn off')) {
    return await handleDeviceControl(temp, messages, getRaspDataByUserId, GetDeviceData, updateStatus, user);
  } else if (temp.includes('show me') && (temp.includes('picture') || temp.includes('image')) && (temp.includes('latest') || temp.includes('oldest'))) {
    return await handleImageRetrieval(temp, messages, getRaspDataByUserId, GetDeviceData, GetMotionPictures, user);
  } else {
    return await handleAIPrompt(prompt, messages);
  }
};

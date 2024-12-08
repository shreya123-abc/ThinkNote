import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios'; // Import Axios

function App() {
  const [transcript1, setTranscript1] = useState('');
  const [transcript2, setTranscript2] = useState('');
  const [recognition1, setRecognition1] = useState(null);
  const [recognition2, setRecognition2] = useState(null);
  const [isRecording1, setIsRecording1] = useState(false);
  const [isRecording2, setIsRecording2] = useState(false);
  const [llmResponse, setLlmResponse] = useState('');

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognitionInstance1 = new SpeechRecognition();
      recognitionInstance1.continuous = true;
      recognitionInstance1.interimResults = true;

      recognitionInstance1.onresult = (event) => {
        const currentTranscript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setTranscript1(currentTranscript);
      };

      recognitionInstance1.onend = () => {
        setIsRecording1(false);
      };

      setRecognition1(recognitionInstance1);

      const recognitionInstance2 = new SpeechRecognition();
      recognitionInstance2.continuous = true;
      recognitionInstance2.interimResults = true;

      recognitionInstance2.onresult = (event) => {
        const currentTranscript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setTranscript2(currentTranscript);
      };

      recognitionInstance2.onend = () => {
        setIsRecording2(false);
      };

      setRecognition2(recognitionInstance2);
    } else {
      alert('Your browser does not support speech recognition. Please try a different browser.');
    }
  }, []);

  const startRecording1 = () => {
    if (recognition1 && !isRecording1) {
      recognition1.start();
      setIsRecording1(true);
    }
  };

  const stopRecording1 = () => {
    if (recognition1 && isRecording1) {
      recognition1.stop();
      setIsRecording1(false);
    }
  };

  const startRecording2 = () => {
    if (recognition2 && !isRecording2) {
      recognition2.start();
      setIsRecording2(true);
    }
  };

  const stopRecording2 = () => {
    if (recognition2 && isRecording2) {
      recognition2.stop();
      setIsRecording2(false);
    }
  };

  const sendToLLM = async () => {
    const combinedText = `${transcript1} ${transcript2}`; // Combine both transcripts

    console.log("Combined Text:", combinedText);
    console.log("API Key:", process.env.REACT_APP_GROQ_API_KEY);

    try {
      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        messages: [
          {
            role: "user",
            content: `I want that my project should work like I want the functionality that the text from the second text box gets combined with the text from the first text box and the data is sent to the LLM model like Groq model and the output gets displayed in the third text box as the user has specified.`
          },
          {
            role: "assistant",
            content: `You want to create a UI component that allows users to combine text from two text boxes and send it to the Groq model.`
          },
          {
            role: "user",
            content: combinedText
          }
        ],
        model: "llama3-8b-8192", // Use the appropriate model ID
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
        stop: null,
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`, // Ensure this is correct
          'Content-Type': 'application/json',
        }
      });

      // Extract the summary from the Groq response
      const summary = response.data.choices[0]?.message?.content || "Unable to generate summary.";
      setLlmResponse(summary); // Set the response from Groq
    } catch (error) {
      console.error('Error sending to LLM:', error);
      setLlmResponse('Failed to send to LLM.');
    }
  };

  // Function to save the LLM response to a text file
  const saveResponse = () => {
    const blob = new Blob([llmResponse], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'your_response.txt'; // Name of the file to be saved
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Clean up the URL object
  };

  return (
    <div className="App">
      <h1>THINKNOTE</h1>
      <p className="tagline"></p>
      <p>Welcome to Think Note</p>
      <p>Organize your thoughts, boost your productivity, and never forget an idea with Think Note - your personal digital notebook.</p>

      <h2>Features</h2>
      <div className="features-container">
        <div className="feature-card">
          <div className="feature-icon">📝</div>
          <h3>Quick Notes</h3>
          <p>Jot down ideas instantly with our intuitive interface.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">✍️</div>
          <h3>Rich Text Editing</h3>
          <p>Format your notes with ease using our powerful editor.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">☁️</div>
          <h3>Cloud Sync</h3>
          <p>Access your notes from any device, anytime, anywhere.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🏷️</div>
          <h3>Tags and Categories</h3>
          <p>Organize your notes effortlessly with custom tags and categories.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔍</div>
          <h3>Search</h3>
          <p>Find any note quickly with our advanced search feature.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🤝</div>
          <h3>Collaboration</h3>
          <p>Share and collaborate on notes with your team members.</p>
        </div>
      </div>

      <h2>Get Started</h2>
      <p>Ready to revolutionize the way you take notes? Sign up now and start your journey with Think Note!</p>
      <button className="signup-button">Sign Up for Free</button>

      <h2>Try It Now</h2>
      <h3>Quick Note</h3>
      <p>Write a story or note you want to make impressive.....</p>
      <textarea
        className="note-input"
        placeholder="Type your note here..."
        value={transcript1}
        onChange={(e) => setTranscript1(e.target.value)}
      ></textarea>
      <div>
        <button className="start-button" onClick={startRecording1} disabled={isRecording1}>
          Start Recording
        </button>
        <button className="stop-button" onClick={stopRecording1} disabled={!isRecording1}>
          Stop Recording
        </button>
      </div>

      <h3>Another Quick Note</h3>
      <p>Write action you want to perform on your text</p>
      <textarea
        className="note-input"
        placeholder="Type your note here..."
        value={transcript2}
        onChange={(e) => setTranscript2(e.target.value)}
      ></textarea>
      <div>
        <button className="start-button" onClick={startRecording2} disabled={isRecording2}>
          Start Recording
        </button>
        <button className="stop-button" onClick={stopRecording2} disabled={!isRecording2}>
          Stop Recording
        </button>
      </div>

      <button className="send-button" onClick={sendToLLM}>
        Send to LLM
      </button>

      <h3>LLM Response</h3>
      <textarea
        className="note-input"
        placeholder="LLM response will appear here..."
        value={llmResponse}
        readOnly
      ></textarea>

      {/* Save Button */}
      <button className="save-button" onClick={saveResponse}>
        Save Response
      </button>
    </div>
  );
}

export default App;

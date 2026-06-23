const regenerateContent = async () => {
  try {
    setLoading(true);

    const formData = new FormData();
    formData.append("topic", topic); 

    if (file) {
      formData.append("file", file); 
    } else {
      console.error("No file selected for upload."); 
    }

    const response = await fetch("http://localhost:5000/api/docs/generate", {
      method: "POST",
      body: formData, // 
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.content) {
      setContent(data.content);
      if (editorRef.current) {
        editorRef.current.innerText = data.content;
      }
    }

  } catch (error) {
    console.error("Error during content regeneration:", error); 
  } finally {
    setLoading(false);
  }
};

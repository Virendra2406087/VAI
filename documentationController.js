const regenerateContent = async () => {
  try {
    setLoading(true);

    const formData = new FormData();
    formData.append("topic", topic); // Ensure topic is appended

    if (file) {
      formData.append("file", file); // Ensure file is appended
    } else {
      console.error("No file selected for upload."); // Log if no file is selected
    }

    const response = await fetch("http://localhost:5000/api/docs/generate", {
      method: "POST",
      body: formData, // ❗ important (no JSON)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`); // Throw error if response is not ok
    }

    const data = await response.json();

    if (data.content) {
      setContent(data.content);
      if (editorRef.current) {
        editorRef.current.innerText = data.content;
      }
    }

  } catch (error) {
    console.error("Error during content regeneration:", error); // Log the error
  } finally {
    setLoading(false);
  }
};

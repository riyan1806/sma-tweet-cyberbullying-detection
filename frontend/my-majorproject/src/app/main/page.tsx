"use client";
import React, { useState } from "react";

import { TextGenerateEffect } from "@/custom_components/TextGeneration";
import { TypewriterEffectSmooth } from "@/custom_components/TypeWriter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import TextToSpeechButton from "@/custom_components/tts";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Table1 from "@/custom_components/table1";
import AudioPlayer from "@/custom_components/audio";
import { HoverBorderGradient } from "@/custom_components/border_button";
import ThreeDotsWave from "@/components/ui/loader";
import Loader from "@/components/ui/loader";
import BouncingDotsLoader from "@/components/ui/loader";

export default function CardWithForm() {
  const [input, setInput] = useState("text");
  const [inputText, setInputText] = useState("");
  const [selectedOption, setSelectedOption] = useState("captioning");
  const [audioFile, setAudioFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [summarizationResult, setSummarizationResult] = useState("");
  const [audio_result, setAudioResult] = useState("");
  const [pdf_result, setPdfResult] = useState("");
  const [image_result1, setImageResult1] = useState("");
  const [generatedText, setGeneratedText] = useState(null);
  const [image_result2, setImageResult2] = useState("");
  const [error, setError] = useState("");
  const [audioSrc, setAudioSrc] = useState("");
  const [loader, setLoader] = useState(false);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleInputTypeChange = (selectedType) => {
    setInput(selectedType);
  };

  const handleOptionChange = (event) => {
    setSelectedOption(event);
    if (selectedOption === "captioning") {
      setImageResult1(null);
    }
    if (selectedOption === "classification") {
      setImageResult2(null);
    }
  };

  const handleAudioChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setAudioFile(selectedFile);
      setAudioSrc(selectedFile);
    }
  };

  const handlePdfChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setPdfFile(selectedFile);
    }
  };

  const TypeWriter = [{ text: summarizationResult }];

  const handleImageChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      try {
        const imageUrl = URL.createObjectURL(selectedFile);
        setImageUrl(imageUrl);
        setImageFile(selectedFile);
      } catch (error) {
        console.error("Failed to create object URL:", error);
      }
    }
  };

  const handleSummarize = async () => {
    setLoader(true);
    try {
      const response = await fetch(`http://localhost:5000/predict`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({ text: inputText })
      });

      const result = await response.json();
      const result1 = JSON.stringify(result);
      const predictedLabel = result.predicted_label.charAt(0).toUpperCase() + result.predicted_label.slice(1); 
      if (response.ok) {
        setSummarizationResult(predictedLabel);
        setLoader(false);
        setError("");
      } else {
        setSummarizationResult("");
        setLoader(false);
        setError(result.error || "An error occurred");
      }
    } catch (error) {
      setSummarizationResult("");
      setLoader(false);
      setError("An error occurred");
    }
  };

  const handleAudioSummarize = async () => {
    setLoader(true);
    try {
      const formData = new FormData();
      formData.append("audio_file", audioFile);

      const response = await fetch(`http://localhost:5000/summarize/audio`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setLoader(false);
        setAudioResult(result.result);
        setError("");
      } else {
        setLoader(false);
        setAudioResult("");
        setError(result.error || "An error occurred");
      }
    } catch (error) {
      setLoader(false);
      setAudioResult("");
      setError("An error occurred");
    }
  };

  const handleImageCaptioning = async () => {
    setLoader(true);
    try {
      if (!imageFile) {
        setError("Please upload an image for captioning.");
        return;
      }

      const formData = new FormData();
      formData.append("image_file", imageFile);

      const response = await fetch("http://localhost:5000/caption_image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const image_result1 = await response.json();
        setLoader(false);
        setImageResult1(image_result1);
        setGeneratedText(image_result1.result[0]?.generated_text);
        console.log(image_result1);
        setError(null);
      } else {
        setLoader(false);
        const errorText = await response.text();
        setImageResult1(null);
        setError(`Image captioning failed: ${errorText}`);
      }
    } catch (error) {
      setLoader(false);
      setImageResult1(null);
      setError("An error occurred");
    }
  };

  const handleImageClassification = async () => {
    setLoader(true);
    try {
      if (!imageFile) {
        setError("Please upload an image for classification.");
        return;
      }

      const formData = new FormData();
      formData.append("image_file", imageFile);

      const response = await fetch(`http://localhost:5000/${selectedOption}`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result1 = await response.json();
        const result = JSON.stringify(result1);
        setLoader(false);
        setImageResult2(result);
        setError(null);
      } else {
        const errorText = await response.text();
        setLoader(false);
        setImageResult2(null);
        setError(`Image classification failed: ${errorText}`);
      }
    } catch (error) {
      setLoader(false);
      setImageResult2(null);
      setError("An error occurred");
    }
  };
  const handleOCR = async () => {
    setLoader(true);
    try {
      const formData = new FormData();
      formData.append("pdf_file", pdfFile);

      const response = await fetch("http://localhost:5000/extract_text", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log(result);

      if (response.ok) {
        const extractedText = result.text;

        const summarizationFormData = new FormData();
        summarizationFormData.append("text", extractedText);

        const summarizationResponse = await fetch(
          "http://localhost:5000/summarize/text",
          {
            method: "POST",
            body: summarizationFormData,
          }
        );

        const summarizationResult = await summarizationResponse.json();

        if (summarizationResponse.ok) {
          setLoader(false);
          console.log(summarizationResult);
          setPdfResult(summarizationResult.result);
          setError("");
        } else {
          setLoader(false);
          setError(summarizationResult.error || "An error occurred");
        }
      }
    } catch (error) {
      setLoader(false);
      setError("An error occurred");
    }
  };

  const tags = image_result2?.result?.tags;

  function countWords(text) {
    // Remove leading and trailing whitespaces
    text = String(text).trim();

    // Split the text into an array of words
    let words = text.split(/\s+/);

    // Filter out empty strings (e.g., multiple whitespaces)
    words = words.filter((word) => word.length > 0);

    // Return the number of words
    return words.length;
  }

  const words = [
    {
      text: "Classify  ",
    },
    {
      text: "  Tweets for  ",
    },
    {
      text: "CYBER-BULLYING",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];

  return (
    <main className="justify-center items-center h-screen flex m-0 overflow-y-auto bg-black">
      <Card className="w-full h-screen overflow-y-scroll py-10 bg-black border-none">
        <CardHeader>
          <CardTitle className="text-6xl text-white">
            <TypewriterEffectSmooth className="text-8xl" words={words} />
          </CardTitle>
          <CardDescription className="text-base">
            Classify in one-click.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4 py-2">
              <div className="flex flex-col space-y-2">
                {input === "text" && (
                  <div className="flex flex-col space-y-2 pt-4">
                    <Label htmlFor="name" className="text-2xl mb-5">
                      Input Tweet:
                    </Label>
                    <Textarea
                      className="text-2xl min-h-32"
                      id="name"
                      placeholder="Type here"
                      value={inputText}
                      onChange={handleInputChange}
                    />
                  </div>
                )}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="grid w-full items-center gap-4 py-2">
          {input === "text" && (
            <div className="flex flex-col space-y-10">
              <HoverBorderGradient>
                <Button
                  className="w-fit bg-black text-white hover:bg-black text-2xl"
                  onClick={handleSummarize}
                >
                  Classify
                </Button>
              </HoverBorderGradient>
              {loader && <BouncingDotsLoader />}
            </div>
          )}
          <div>
            {summarizationResult && input === "text" && (
              <div className="pt-10 space-y-10">
                <Label className="justify-center py-2 text-2xl font-normal mb-20">
                  Classification result:<br /> (Not_cyberbullying, Religion ,Gender)
                </Label>
                {/* <Textarea readOnly className="pt-5 h-[200px] "> */}
                <TextGenerateEffect 
                  words={summarizationResult}
                  className="pb-5 text-2xl"
                />
                {/* <TypewriterEffectSmooth className="w-full " words={TypeWriter}/> */}
                {/* {summarizationResult}
                </Textarea> */}              
              </div>
            )}
            {error && <p style={{ color: "red" }}>{error}</p>}
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}

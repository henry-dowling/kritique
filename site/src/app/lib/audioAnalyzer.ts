export class AudioAnalyzer {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private dataArray: Uint8Array;
  private source:
    | MediaElementAudioSourceNode
    | MediaStreamAudioSourceNode
    | null = null;
  private isActive: boolean = false;

  constructor(fftSize: number = 256) {
    this.audioContext = new (window.AudioContext ||
      (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = fftSize;

    // Create the array to hold frequency data
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
  }

  // Connect to an HTML audio element (podcast playback)
  connectToAudioElement(audioElement: HTMLAudioElement): void {
    if (this.source) {
      this.source.disconnect();
    }

    // Prevent multiple source nodes for the same element
    try {
      this.source = this.audioContext.createMediaElementSource(audioElement);
    } catch (err) {
      console.error("Failed to create MediaElementSource:", err);
      return;
    }
    this.source.connect(this.analyser);
    // Connect to destination to allow audio to play through speakers
    console.log(
      "Connecting analyzer to destination: ",
      this.audioContext.destination
    );
    this.analyser.connect(this.audioContext.destination);
    this.isActive = true;
  }

  // Connect to user's microphone
  async connectToMicrophone(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (this.source) {
        this.source.disconnect();
      }

      this.source = this.audioContext.createMediaStreamSource(stream);
      this.source.connect(this.analyser);
      // Don't connect to destination for microphone to avoid feedback
      this.isActive = true;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      this.isActive = false;
    }
  }

  // Get current frequency data - returns average amplitude
  getFrequencyData(): number {
    if (!this.isActive) return 0;

    this.analyser.getByteFrequencyData(this.dataArray);
    // console.log(
    //   "Frequency data number of non zeros: ",
    //   this.dataArray.filter((value) => value !== 0).length
    // );

    // Calculate the average frequency amplitude
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }

    return sum / this.dataArray.length;
  }

  // Cleanup
  disconnect(): void {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    this.isActive = false;
  }
}

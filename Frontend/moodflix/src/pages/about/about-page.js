import { oodflix } from "../../img.js";

class AboutPage {
  constructor() {
    this.root = document.createElement("section");
    this.root.className = "about";
    this.root.id = "about";
  }

  render() {
    this.root.innerHTML = `
      <div class="about-content">
        <div class="text">
          <h2>Mood Flix</h2>
          <p>
            Moodflix adalah platform rekomendasi film yang menyesuaikan pilihan
            tontonan dengan suasana hati Anda. Kami percaya bahwa setiap mood
            memiliki film yang tepat, dan Moodflix hadir untuk memudahkan Anda
            menemukannya. Dengan teknologi cerdas dan pendekatan personal,
            kami bantu Anda menikmati pengalaman menonton yang lebih relevan
            dan menyenangkan.
          </p>
        </div>
        <div class="image">
          <img src="${oodflix}" alt="Movie Night" />
        </div>
      </div>
    `;
    return this.root;
  }
}

export default AboutPage;
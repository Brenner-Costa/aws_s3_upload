export default function VideoPlayer({ videoUrl }: any) {
    return (
      <div>
        <video width="50%" controls>
          <source src={videoUrl} type="video/mp4" />
          Seu navegador não suporta a reprodução deste vídeo.
        </video>
      </div>
    );
  }
  
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);

  const imagePost = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div>
      <p>import d'image</p>
    </div>
  );
}

import { useEffect, useState } from "react";
import api, { API_BASE_URL } from "../../api/api";

export default function LostFound() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");

  function loadItems(q) {
    api.get("/lost-found/items", { params: q ? { q } : {} }).then((res) => setItems(res.data));
  }

  useEffect(() => {
    loadItems();
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    loadItems(query);
  }

  return (
    <div className="page">
      <h2>Lost &amp; Found — Search Found Items</h2>
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          placeholder="Search by item name or description..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <div className="lost-item-grid">
        {items.map((item) => (
          <div className="lost-item-card" key={item.id}>
            {item.image_path && (
              <img src={`${API_BASE_URL}/${item.image_path}`} alt={item.item_name} />
            )}
            <h4>{item.item_name}</h4>
            {item.description && <p>{item.description}</p>}
            {item.found_location && <p className="hint-text">Found at: {item.found_location}</p>}
            {item.kept_at_station && (
              <p className="hint-text"><strong>Claim at:</strong> {item.kept_at_station}</p>
            )}
          </div>
        ))}
        {items.length === 0 && <p>No matching items found.</p>}
      </div>
    </div>
  );
}

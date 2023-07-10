import "./styles.css";
import StockChart from "./components/StockChart";
import stocks from "./data";

function App() {
  return (
    <div className="App">
      <StockChart dataset={stocks} seriesName="上证综合指数" />
    </div>
  );
}

export default App;

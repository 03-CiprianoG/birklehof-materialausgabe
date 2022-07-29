// import '../Html5QrcodePlugin/App.css';

import React from 'react';
import Html5QrcodePlugin from '../plugins/Html5QrcodePlugin/Html5QrcodePlugin.jsx';
import ResultContainerPlugin from '../plugins/Html5QrcodePlugin/ResultContainerPlugin.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      decodedResults: []
    };

    // This binding is necessary to make `this` work in the callback.
    this.onNewScanResult = this.onNewScanResult.bind(this);
  }

  render() {
    return (
      <div className="App">
        <section className="App-section">
          <div className="App-section-title"> Html5-qrcode Next JS By Brilliant.ng</div>
          <br />
          <br />
          <br />
          <Html5QrcodePlugin fps={10} qrbox={250} disableFlip={false} qrCodeSuccessCallback={this.onNewScanResult} />
          <ResultContainerPlugin results={this.state.decodedResults} />
        </section>
      </div>
    );
  }

  onNewScanResult(decodedText, decodedResult) {
    // let decodedResults = this.state.decodedResults;
    // decodedResults.push(decodedResult);
    this.setState((state, _props) => {
      state.decodedResults.push(decodedResult);
      return state;
    });
  }
}

export default App;

// Enhanced Cloud Proxy Client with multiple fallback services and automatic testing
class CloudProxyClient {
  constructor() {
    this.isConnected = false;
    this.proxyServices = [
      // Primary services
      {
        name: 'AllOrigins',
        url: 'https://api.allorigins.win/get?url=',
        responseType: 'json',
        extractData: (response) => response.contents,
        active: true
      },
      {
        name: 'CorsAnywhere',
        url: 'https://cors-anywhere.herokuapp.com/',
        responseType: 'direct',
        active: true
      },
      {
        name: 'CorsProxy.io',
        url: 'https://corsproxy.io/?',
        responseType: 'direct',
        active: true
      },
      {
        name: 'CodeTabs',
        url: 'https://api.codetabs.com/v1/proxy?quest=',
        responseType: 'direct',
        active: true
      },
      // Fallback services
      {
        name: 'ThingProxy',
        url: 'https://thingproxy.freeboard.io/fetch/',
        responseType: 'direct',
        active: true
      },
      {
        name: 'CrossOrigin',
        url: 'https://crossorigin.me/',
        responseType: 'direct',
        active: true
      },
      {
        name: 'YTProxy',
        url: 'https://yt-proxy.vercel.app/proxy?url=',
        responseType: 'direct',
        active: true
      },
      {
        name: 'ZeroProxy',
        url: 'https://0proxy.vercel.app/api/proxy?url=',
        responseType: 'direct',
        active: true
      }
    ];
    
    this.currentServiceIndex = 0;
    this.workingServices = [];
    this.connectionListeners = [];
    this.statusListeners = [];
    this.status = 'disconnected';
    this.connectionId = null;
    this.lastTestTime = 0;
    this.testIntervalMinutes = 5;
    this.loadState();
  }

  // Save current state to localStorage
  saveState() {
    try {
      const state = {
        workingServices: this.workingServices.map(s => s.name),
        currentServiceIndex: this.currentServiceIndex,
        lastTestTime: this.lastTestTime,
        status: this.status,
        isConnected: this.isConnected
      };
      localStorage.setItem('browserOS_proxyState', JSON.stringify(state));
    } catch (err) {
      console.warn('Failed to save proxy state', err);
    }
  }

  // Load state from localStorage
  loadState() {
    try {
      const savedState = localStorage.getItem('browserOS_proxyState');
      if (savedState) {
        const state = JSON.parse(savedState);
        
        // Only restore working services if test isn't stale
        const now = Date.now();
        const testAge = (now - state.lastTestTime) / (1000 * 60); // minutes
        
        if (testAge < this.testIntervalMinutes && state.workingServices && state.workingServices.length > 0) {
          this.workingServices = state.workingServices.map(name => 
            this.proxyServices.find(s => s.name === name)
          ).filter(Boolean);
          
          this.currentServiceIndex = Math.min(
            state.currentServiceIndex || 0, 
            Math.max(0, this.workingServices.length - 1)
          );
          
          this.status = state.status || 'disconnected';
          this.isConnected = state.isConnected || false;
          this.lastTestTime = state.lastTestTime || 0;
          
          console.log(`Restored ${this.workingServices.length} working proxy services from cache`);
        }
      }
    } catch (err) {
      console.warn('Failed to load proxy state', err);
    }
  }

  // Test if a URL is accessible through a proxy service
  async testService(service, testUrl = 'https://httpbin.org/get') {
    try {
      console.log(`Testing proxy service: ${service.name}`);
      const proxyUrl = service.url + encodeURIComponent(testUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(proxyUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 Browser OS'
        }
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.log(`Service ${service.name} failed with status: ${response.status}`);
        return false;
      }
      
      // For JSON response types, we need to check if the response is valid
      if (service.responseType === 'json') {
        try {
          const data = await response.json();
          if (!data || (service.extractData && !service.extractData(data))) {
            console.log(`Service ${service.name} returned invalid JSON`);
            return false;
          }
        } catch (e) {
          console.log(`Service ${service.name} returned invalid JSON: ${e.message}`);
          return false;
        }
      }

      console.log(`Service ${service.name} is working!`);
      return true;
    } catch (error) {
      console.log(`Service ${service.name} test failed: ${error.message}`);
      return false;
    }
  }

  // Find all working proxy services
  async findWorkingServices() {
    console.log('Finding working proxy services...');
    this.status = 'connecting';
    this._notifyStatusChange();
    
    const now = Date.now();
    // If we've tested recently and have working services, skip testing
    if ((now - this.lastTestTime) < (this.testIntervalMinutes * 60 * 1000) && 
        this.workingServices.length > 0) {
      console.log('Using cached working services');
      this.status = 'connected';
      this.isConnected = true;
      this._notifyStatusChange();
      this._notifyConnection();
      return this.workingServices;
    }
    
    // Test all services in parallel for efficiency
    const results = await Promise.all(
      this.proxyServices
        .filter(service => service.active)
        .map(async service => {
          const works = await this.testService(service);
          return { service, works };
        })
    );
    
    // Filter out services that don't work
    this.workingServices = results
      .filter(result => result.works)
      .map(result => result.service);
    
    this.lastTestTime = now;
    this.saveState();
    
    console.log(`Found ${this.workingServices.length} working services`);
    return this.workingServices;
  }

  // Connect to proxy service
  async connect() {
    if (this.isConnected && this.workingServices.length > 0) {
      console.log('Already connected to proxy service');
      return this;
    }

    try {
      const workingServices = await this.findWorkingServices();
      
      if (workingServices.length > 0) {
        this.currentServiceIndex = 0;
        this.isConnected = true;
        this.status = 'connected';
        this.connectionId = `proxy-${Date.now()}`;
        
        console.log(`Connected to proxy service: ${workingServices[0].name}`);
        this._notifyConnection();
        this._notifyStatusChange();
      } else {
        this.isConnected = false;
        this.status = 'error';
        console.error('No working proxy services found');
        this._notifyStatusChange();
      }
    } catch (error) {
      this.isConnected = false;
      this.status = 'error';
      console.error('Error connecting to proxy service:', error);
      this._notifyStatusChange();
    }
    
    this.saveState();
    return this;
  }

  // Disconnect from proxy service
  disconnect() {
    this.isConnected = false;
    this.status = 'disconnected';
    this._notifyStatusChange();
    this.saveState();
    return this;
  }

  // Get current proxy service
  getCurrentService() {
    if (this.workingServices.length === 0) {
      return null;
    }
    return this.workingServices[this.currentServiceIndex];
  }

  // Switch to next working service
  switchToNextService() {
    if (this.workingServices.length <= 1) {
      return false;
    }
    
    this.currentServiceIndex = (this.currentServiceIndex + 1) % this.workingServices.length;
    console.log(`Switched to proxy service: ${this.getCurrentService().name}`);
    this.saveState();
    return true;
  }

  // Get a proxy URL for the given target URL
  getProxyUrl(targetUrl) {
    if (!targetUrl) return null;
    
    // Format the URL if needed
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }
    
    // If not connected or no working services, return direct URL
    if (!this.isConnected || this.workingServices.length === 0) {
      console.warn('No working proxy services available, using direct URL');
      return targetUrl;
    }
    
    const service = this.getCurrentService();
    return service.url + encodeURIComponent(targetUrl);
  }

  // Force retry connection
  async retry() {
    this.workingServices = [];
    this.lastTestTime = 0;
    this.status = 'connecting';
    this._notifyStatusChange();
    
    return await this.connect();
  }

  // Check connection status
  checkStatus() {
    const service = this.getCurrentService();
    
    return {
      connected: this.isConnected,
      status: this.status,
      connectionId: this.connectionId,
      service: service ? service.name : null,
      serviceUrl: service ? service.url : null,
      workingServices: this.workingServices.length,
      workingServiceNames: this.workingServices.map(s => s.name),
      lastTestTime: this.lastTestTime,
      testAge: Math.round((Date.now() - this.lastTestTime) / (1000 * 60)) // minutes
    };
  }

  // Add connection listener
  onConnect(callback) {
    this.connectionListeners.push(callback);
    
    // Call immediately if already connected
    if (this.isConnected) {
      const status = this.checkStatus();
      callback(status);
    }
    
    return this;
  }

  // Add status change listener
  onStatusChange(callback) {
    this.statusListeners.push(callback);
    
    // Call immediately with current status
    const status = this.checkStatus();
    callback(status);
    
    return this;
  }

  // Private: Notify all connection listeners
  _notifyConnection() {
    const status = this.checkStatus();
    this.connectionListeners.forEach(callback => callback(status));
  }

  // Private: Notify all status listeners
  _notifyStatusChange() {
    const status = this.checkStatus();
    this.statusListeners.forEach(callback => callback(status));
  }
}

// Create singleton instance
const cloudProxyClient = new CloudProxyClient();

// Auto-connect when module is imported
setTimeout(async () => {
  await cloudProxyClient.connect();
}, 500);

export default cloudProxyClient;
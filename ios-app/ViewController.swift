import UIKit
import WebKit
import AVFoundation

/**
 * AwaazAI (J.A.R.V.I.S. Edition) — Native iOS ViewController
 * Wraps the live AwaazAI call screening & voice studio in a full-screen WKWebView
 * with native microphone and WebAudio synthesis permissions enabled.
 */
class ViewController: UIViewController, WKUIDelegate, WKNavigationDelegate {

    private var webView: WKWebView!
    private let appURLString = "https://ais-pre-k2tx2w4mficbzbfl6iv6wp-23015944067.asia-east1.run.app"

    override func loadView() {
        let webConfiguration = WKWebViewConfiguration()
        webConfiguration.allowsInlineMediaPlayback = true
        webConfiguration.mediaTypesRequiringUserActionForPlayback = []

        webView = WKWebView(frame: .zero, configuration: webConfiguration)
        webView.uiDelegate = self
        webView.navigationDelegate = self
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 2/255, green: 6/255, blue: 23/255, alpha: 1.0)
        view = webView
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        requestMicrophoneAccess()

        if let url = URL(string: appURLString) {
            let request = URLRequest(url: url, cachePolicy: .useProtocolCachePolicy, timeoutInterval: 30)
            webView.load(request)
        }
    }

    private func requestMicrophoneAccess() {
        AVAudioSession.sharedInstance().requestRecordPermission { granted in
            if granted {
                try? AVAudioSession.sharedInstance().setCategory(.playAndRecord, mode: .voiceChat, options: [.defaultToSpeaker, .allowBluetooth])
                try? AVAudioSession.sharedInstance().setActive(true)
            }
        }
    }

    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .lightContent
    }
}

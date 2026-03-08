import './HowItWorksPage.css';

export default function HowItWorksPage() {
    return (
        <div className="how-it-works-page">
            <div className="page-header">
                <h1>📖 How It Works</h1>
                <p>Welcome to CarCues — your gamified car spotting companion</p>
            </div>

            {/* Intro */}
            <section className="guide-section animate-fade-in-up">
                <div className="guide-card highlight-card">
                    <h2>🏎️ What is CarCues?</h2>
                    <p>
                        CarCues turns everyday car spotting into a thrilling game.
                        Upload photos of cars you spot in the wild, let our AI identify them,
                        and earn rarity points based on how rare and exclusive each car is.
                        Build your collection, climb the leaderboard, and compete with friends!
                    </p>
                </div>
            </section>

            {/* How to Spot */}
            <section className="guide-section animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="section-title">📸 How to Spot a Car</h2>
                <div className="steps-grid">
                    <div className="step-card">
                        <div className="step-number">1</div>
                        <h3>Take a Photo</h3>
                        <p>Snap a photo of any car you spot. Try to capture the badge or emblem — our AI reads text on the car for better accuracy!</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">2</div>
                        <h3>Upload & Identify</h3>
                        <p>Upload the photo and our AI will analyze it using Google Vision. If confidence is 80%+, it auto-fills make, model, and year.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">3</div>
                        <h3>Review & Save</h3>
                        <p>Verify the details, adjust if needed using the dropdowns, and save it to your collection. GPS location is extracted automatically!</p>
                    </div>
                </div>
            </section>

            {/* Rarity Scoring */}
            <section className="guide-section animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h2 className="section-title">🔥 Rarity Scoring</h2>
                <p className="section-desc">
                    Every car gets a <strong>Rarity Score</strong> — an uncapped running score based on three factors:
                </p>

                <div className="scoring-grid">
                    <div className="scoring-card">
                        <div className="scoring-icon">🏢</div>
                        <h3>Brand Tier</h3>
                        <p className="scoring-range">15 – 60 pts</p>
                        <ul>
                            <li><span className="tier-dot mythic"></span> <strong>Mythic</strong>: Bugatti, Pagani, Koenigsegg, Rimac — 60 pts</li>
                            <li><span className="tier-dot legendary"></span> <strong>Legendary</strong>: Ferrari, Lamborghini, McLaren, Aston Martin — 50 pts</li>
                            <li><span className="tier-dot epic"></span> <strong>Epic</strong>: Porsche, Rolls-Royce, Bentley, Mercedes-AMG — 38 pts</li>
                            <li><span className="tier-dot rare"></span> <strong>Rare</strong>: Audi, Jaguar, Lucid, Alpine — 28 pts</li>
                            <li><span className="tier-dot uncommon"></span> <strong>Uncommon</strong>: Tesla, Ford, Nissan, Toyota — 20 pts</li>
                            <li><span className="tier-dot common"></span> <strong>Common</strong>: Other brands — 15 pts</li>
                        </ul>
                    </div>

                    <div className="scoring-card">
                        <div className="scoring-icon">🏷️</div>
                        <h3>Category</h3>
                        <p className="scoring-range">0 – 15 pts</p>
                        <ul>
                            <li>Hypercar — +15 pts</li>
                            <li>Supercar — +10 pts</li>
                            <li>Race Car — +8 pts</li>
                            <li>Classic — +7 pts</li>
                            <li>Sports Car — +5 pts</li>
                            <li>Muscle Car — +4 pts</li>
                            <li>Luxury — +3 pts</li>
                        </ul>
                    </div>

                    <div className="scoring-card">
                        <div className="scoring-icon">🏭</div>
                        <h3>Production Volume</h3>
                        <p className="scoring-range">0 – 30 pts</p>
                        <ul>
                            <li>≤ 2 units — +30 pts <span className="tag">One-off</span></li>
                            <li>≤ 10 units — +25 pts</li>
                            <li>≤ 50 units — +20 pts</li>
                            <li>≤ 100 units — +18 pts</li>
                            <li>≤ 500 units — +12 pts</li>
                            <li>≤ 2,000 units — +7 pts</li>
                            <li>≤ 5,000 units — +5 pts</li>
                            <li>Mass Produced — +0 pts</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Rarity Tiers */}
            <section className="guide-section animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <h2 className="section-title">💎 Rarity Tiers</h2>
                <div className="tiers-table-container">
                    <table className="tiers-table">
                        <thead>
                            <tr>
                                <th>Score Range</th>
                                <th>Tier</th>
                                <th>Example Cars</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="tier-row mythic-row">
                                <td><strong>86+</strong></td>
                                <td><span className="tier-badge mythic-badge">🔴 Mythic</span></td>
                                <td>Bugatti Centodieci, Aston Martin Victor, Pagani Zonda Cinque</td>
                            </tr>
                            <tr className="tier-row legendary-row">
                                <td><strong>71 – 85</strong></td>
                                <td><span className="tier-badge legendary-badge">🟨 Legendary</span></td>
                                <td>Ferrari LaFerrari, Koenigsegg Regera, McLaren P1</td>
                            </tr>
                            <tr className="tier-row epic-row">
                                <td><strong>51 – 70</strong></td>
                                <td><span className="tier-badge epic-badge">🟪 Epic</span></td>
                                <td>Porsche Carrera GT, Ferrari F40, Lamborghini Aventador SVJ</td>
                            </tr>
                            <tr className="tier-row rare-row">
                                <td><strong>36 – 50</strong></td>
                                <td><span className="tier-badge rare-badge">🟦 Rare</span></td>
                                <td>Porsche 911 GT3 RS, BMW M4 CSL, McLaren 720S</td>
                            </tr>
                            <tr className="tier-row uncommon-row">
                                <td><strong>21 – 35</strong></td>
                                <td><span className="tier-badge uncommon-badge">🟩 Uncommon</span></td>
                                <td>Audi RS7, Tesla Model S Plaid, Jaguar F-Type R</td>
                            </tr>
                            <tr className="tier-row common-row">
                                <td><strong>1 – 20</strong></td>
                                <td><span className="tier-badge common-badge">⬜ Common</span></td>
                                <td>Toyota Camry, Honda Civic, Ford F-150</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Leveling */}
            <section className="guide-section animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <h2 className="section-title">⬆️ Leveling Up</h2>
                <div className="guide-card">
                    <div className="level-info-grid">
                        <div className="level-info-card">
                            <div className="level-icon">⭐</div>
                            <h3>Earn XP</h3>
                            <p>Every car you save adds its rarity score to your total XP. Higher rarity = more XP per spot.</p>
                        </div>
                        <div className="level-info-card">
                            <div className="level-icon">📈</div>
                            <h3>200 XP Per Level</h3>
                            <p>Level up every 200 rarity points. Spot a Mythic car and jump multiple levels at once!</p>
                        </div>
                        <div className="level-info-card">
                            <div className="level-icon">🏆</div>
                            <h3>Leaderboard</h3>
                            <p>Compete with other spotters! Climb the leaderboard by accumulating the highest total rarity points.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tips */}
            <section className="guide-section animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <h2 className="section-title">💡 Pro Tips</h2>
                <div className="tips-grid">
                    <div className="tip-card">
                        <div className="tip-icon">📷</div>
                        <h3>Capture the Badge</h3>
                        <p>Our AI reads text on cars. A clear shot of the model badge (e.g., "GT3 RS") dramatically improves identification accuracy.</p>
                    </div>
                    <div className="tip-card">
                        <div className="tip-icon">🗺️</div>
                        <h3>Keep GPS On</h3>
                        <p>Photos with GPS metadata automatically pin to your map. Enable location services on your camera for the best experience.</p>
                    </div>
                    <div className="tip-card">
                        <div className="tip-icon">🏭</div>
                        <h3>Hunt Limited Editions</h3>
                        <p>Cars with low production numbers score massive points. A single Bugatti Centodieci spot (10 made) is worth 100 rarity!</p>
                    </div>
                    <div className="tip-card">
                        <div className="tip-icon">✏️</div>
                        <h3>Override When Needed</h3>
                        <p>If the AI misidentifies a car, use the override dropdowns to correct it. The rarity recalculates automatically using our curated database.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

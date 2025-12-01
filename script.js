const dogemonData = [];

let playerPokemon = null;
let opponentPokemon = null;
let playerCurrentHP = 100;
let opponentCurrentHP = 100;

function displayPokedex() {
    const grid = document.querySelector('.pokemon-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    dogemonData.forEach(dogemon => {
        const card = createPokemonCard(dogemon);
        grid.appendChild(card);
    });
}

function createPokemonCard(dogemon) {
    const card = document.createElement('div');
    card.className = 'pokemon-card';
    card.onclick = () => selectPokemonForBattle(dogemon);
    
    const sprite = document.createElement('div');
    sprite.className = 'pokemon-sprite';
    sprite.textContent = dogemon.emoji;
    
    const name = document.createElement('p');
    name.className = 'pokemon-name';
    name.textContent = `#${dogemon.id} ${dogemon.name}`;
    
    const typesContainer = document.createElement('div');
    dogemon.type.forEach(type => {
        const typeSpan = document.createElement('span');
        typeSpan.className = `pokemon-type type-${type}`;
        typeSpan.textContent = type.toUpperCase();
        typesContainer.appendChild(typeSpan);
    });
    
    const stats = document.createElement('p');
    stats.style.fontSize = '0.9rem';
    stats.style.color = '#666';
    stats.textContent = `HP: ${dogemon.hp} | ATK: ${dogemon.attack} | DEF: ${dogemon.defense}`;
    
    card.appendChild(sprite);
    card.appendChild(name);
    card.appendChild(typesContainer);
    card.appendChild(stats);
    
    return card;
}

function searchPokemon() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase();
    const grid = document.querySelector('.pokemon-grid');
    
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const filteredPokemon = dogemonData.filter(dogemon => 
        dogemon.name.toLowerCase().includes(searchTerm) ||
        dogemon.type.some(type => type.includes(searchTerm))
    );
    
    filteredPokemon.forEach(dogemon => {
        const card = createPokemonCard(dogemon);
        grid.appendChild(card);
    });
}

function selectPokemonForBattle(dogemon) {
    playerPokemon = dogemon;
    playerCurrentHP = dogemon.hp;
    updateBattleDisplay();
    
    if (!opponentPokemon) {
        selectRandomOpponent();
    }
}

function selectRandomOpponent() {
    const randomIndex = Math.floor(Math.random() * dogemonData.length);
    opponentPokemon = dogemonData[randomIndex];
    opponentCurrentHP = opponentPokemon.hp;
    updateBattleDisplay();
}

function updateBattleDisplay() {
    const playerSlot = document.querySelector('#playerPokemon .pokemon-card');
    const opponentSlot = document.querySelector('#opponentPokemon .pokemon-card');
    
    if (playerPokemon && playerSlot) {
        playerSlot.innerHTML = `
            <div class="hp-bar">
                <div class="hp-fill" style="width: ${(playerCurrentHP / playerPokemon.hp) * 100}%"></div>
            </div>
            <div class="pokemon-sprite">${playerPokemon.emoji}</div>
            <p class="pokemon-name">${playerPokemon.name}</p>
            <p style="font-size: 0.9rem;">HP: ${playerCurrentHP}/${playerPokemon.hp}</p>
        `;
    }
    
    if (opponentPokemon && opponentSlot) {
        opponentSlot.innerHTML = `
            <div class="hp-bar">
                <div class="hp-fill" style="width: ${(opponentCurrentHP / opponentPokemon.hp) * 100}%"></div>
            </div>
            <div class="pokemon-sprite">${opponentPokemon.emoji}</div>
            <p class="pokemon-name">${opponentPokemon.name}</p>
            <p style="font-size: 0.9rem;">HP: ${opponentCurrentHP}/${opponentPokemon.hp}</p>
        `;
    }
}

function attack() {
    if (!playerPokemon || !opponentPokemon) {
        alert("Please select a Dogemon from the Pokédex first!");
        return;
    }
    
    const damage = calculateDamage(playerPokemon.attack, opponentPokemon.defense);
    opponentCurrentHP = Math.max(0, opponentCurrentHP - damage);
    
    showBattleMessage(`${playerPokemon.name} attacks! Damage: ${damage}`);
    
    updateBattleDisplay();
    
    if (opponentCurrentHP <= 0) {
        setTimeout(() => {
            showBattleMessage(`${opponentPokemon.name} fainted! You win!`);
            resetBattle();
        }, 1000);
    } else {
        setTimeout(opponentAttack, 1500);
    }
}

function opponentAttack() {
    const damage = calculateDamage(opponentPokemon.attack, playerPokemon.defense);
    playerCurrentHP = Math.max(0, playerCurrentHP - damage);
    
    showBattleMessage(`${opponentPokemon.name} counter-attacks! Damage: ${damage}`);
    
    updateBattleDisplay();
    
    if (playerCurrentHP <= 0) {
        setTimeout(() => {
            showBattleMessage(`${playerPokemon.name} fainted! You lost...`);
            resetBattle();
        }, 1000);
    }
}

function defend() {
    if (!playerPokemon || !opponentPokemon) {
        alert("Please select a Dogemon from the Pokédex first!");
        return;
    }
    
    showBattleMessage(`${playerPokemon.name} defends!`);
    
    setTimeout(() => {
        const reducedDamage = Math.floor(calculateDamage(opponentPokemon.attack, playerPokemon.defense) / 2);
        playerCurrentHP = Math.max(0, playerCurrentHP - reducedDamage);
        showBattleMessage(`${opponentPokemon.name} attacks! Reduced damage: ${reducedDamage}`);
        updateBattleDisplay();
    }, 1000);
}

function useItem() {
    if (!playerPokemon) {
        alert("Please select a Dogemon from the Pokédex first!");
        return;
    }
    
    const healAmount = 30;
    playerCurrentHP = Math.min(playerPokemon.hp, playerCurrentHP + healAmount);
    
    showBattleMessage(`Potion used! ${playerPokemon.name} recovers ${healAmount} HP!`);
    updateBattleDisplay();
    
    setTimeout(opponentAttack, 1500);
}

function flee() {
    if (!playerPokemon || !opponentPokemon) {
        alert("Please select a Dogemon from the Pokédex first!");
        return;
    }
    
    showBattleMessage("You fled from battle!");
    setTimeout(resetBattle, 1500);
}

function calculateDamage(attack, defense) {
    const baseDamage = attack - (defense / 2);
    const randomFactor = Math.random() * 0.4 + 0.8;
    return Math.floor(Math.max(5, baseDamage * randomFactor));
}

function showBattleMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        font-size: 1.2rem;
        z-index: 1000;
    `;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        document.body.removeChild(messageDiv);
    }, 2000);
}

function resetBattle() {
    setTimeout(() => {
        selectRandomOpponent();
        if (playerPokemon) {
            playerCurrentHP = playerPokemon.hp;
            updateBattleDisplay();
        }
    }, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
    displayPokedex();
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', searchPokemon);
    }
    
    const startButton = document.querySelector('.btn-primary');
    if (startButton) {
        startButton.addEventListener('click', () => {
            document.getElementById('pokedex').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    createGrassBlades();
    createFloatingLeaves();
    createPokedex();
});

function createGrassBlades() {
    const grassAnimation = document.getElementById('grassAnimation');
    if (!grassAnimation) return;
    
    for (let i = 0; i < 100; i++) {
        const blade = document.createElement('div');
        blade.className = 'grass-blade';
        blade.style.left = `${Math.random() * 100}%`;
        blade.style.height = `${20 + Math.random() * 30}px`;
        blade.style.animationDelay = `${Math.random() * 3}s`;
        blade.style.animationDuration = `${2 + Math.random() * 2}s`;
        grassAnimation.appendChild(blade);
    }
}

function createFloatingLeaves() {
    const floatingLeaves = document.getElementById('floatingLeaves');
    if (!floatingLeaves) return;
    
    setInterval(() => {
        const leaf = document.createElement('div');
        leaf.className = 'leaf';
        leaf.style.left = `${Math.random() * 100}%`;
        leaf.style.animationDuration = `${8 + Math.random() * 4}s`;
        leaf.style.background = `hsl(${80 + Math.random() * 40}, 70%, ${30 + Math.random() * 20}%)`;
        floatingLeaves.appendChild(leaf);
        
        setTimeout(() => {
            if (leaf && leaf.parentNode) {
                leaf.parentNode.removeChild(leaf);
            }
        }, 12000);
    }, 2000);
}

function createPokedex() {
    const pokedexComplete = document.getElementById('pokedexComplete');
    if (!pokedexComplete) return;
    
    // Base de données avec seulement DOGEMON
    const dogemons = [
        {
            id: 1,
            name: "DOGEMON",
            sprite: `<img src="logo.png" style="width: 60px; height: 60px; object-fit: contain;">`,
            types: ["doge", "grass"],
            description: "The legendary original DOGEmon that combines Venusaur's powers with pure meme energy. Its 'Much Wow' ability can paralyze opponents with amazement.",
            stats: { hp: 130, atk: 82, def: 83, spd: 80, meme: 150 },
            evolution: [1]
        }
    ];
    
    let currentDoge = 0;
    let isShiny = false;
    
    function updateDisplay() {
        const doge = dogemons[currentDoge];
        
        // Créer le HTML complet du Pokédex
        const pokedexHTML = `
            <!-- Left Panel -->
            <div class="pokedex-left">
                <div class="top-lights">
                    <div class="main-light"></div>
                    <div class="small-lights">
                        <div class="small-light red"></div>
                        <div class="small-light yellow"></div>
                        <div class="small-light green"></div>
                    </div>
                </div>
                
                <div class="main-screen">
                    <div class="screen-header">
                        <span class="doge-number">#${String(doge.id).padStart(3, '0')}</span>
                        <span class="doge-name">${doge.name}</span>
                    </div>
                    
                    <div class="doge-display">
                        <div class="doge-sprite ${isShiny ? 'shiny' : ''}" id="dogeSprite">${doge.sprite}</div>
                    </div>
                    
                    <div class="doge-types">
                        ${doge.types.map(type => `<span class="type-badge ${type}">${type.toUpperCase()}</span>`).join('')}
                    </div>
                    
                    <div class="doge-description">${doge.description}</div>
                </div>
            </div>
            
            <!-- Right Panel -->
            <div class="pokedex-right">
                <div class="stats-panel">
                    <div class="stats-title">📊 STATS</div>
                    
                    <div class="stat-row">
                        <span class="stat-label">❤️ HP</span>
                        <div class="stat-bar">
                            <div class="stat-fill" style="width: ${Math.min(doge.stats.hp, 100)}%"></div>
                        </div>
                        <span class="stat-value">${doge.stats.hp}</span>
                    </div>
                    
                    <div class="stat-row">
                        <span class="stat-label">⚔️ ATK</span>
                        <div class="stat-bar">
                            <div class="stat-fill" style="width: ${Math.min(doge.stats.atk, 100)}%"></div>
                        </div>
                        <span class="stat-value">${doge.stats.atk}</span>
                    </div>
                    
                    <div class="stat-row">
                        <span class="stat-label">🛡️ DEF</span>
                        <div class="stat-bar">
                            <div class="stat-fill" style="width: ${Math.min(doge.stats.def, 100)}%"></div>
                        </div>
                        <span class="stat-value">${doge.stats.def}</span>
                    </div>
                    
                    <div class="stat-row">
                        <span class="stat-label">💨 SPD</span>
                        <div class="stat-bar">
                            <div class="stat-fill" style="width: ${Math.min(doge.stats.spd, 100)}%"></div>
                        </div>
                        <span class="stat-value">${doge.stats.spd}</span>
                    </div>
                    
                </div>
                
                <div class="evolution-panel">
                    <div class="evolution-title">CONTRACT & SOCIAL</div>
                    <div class="contract-info">
                        <div class="contract-row">
                            <span class="contract-label">Contract:</span>
                            <span class="contract-value" onclick="copyContract()" style="cursor: pointer; font-size: 0.5em; word-break: break-all;" title="Click to copy">
                                coming soon
                            </span>
                        </div>
                        <div class="contract-row">
                            <span class="contract-label">X:</span>
                            <a href="https://x.com/DogeTheDog/status/515615403876560896?s=20" target="_blank" class="twitter-link">
                                X
                            </a>
                        </div>
                        <div class="contract-row">
                            <span class="contract-label">Telegram:</span>
                            <a href="https://t.me/portaldogemon" target="_blank" class="twitter-link">
                                Telegram Community
                            </a>
                        </div>
                    </div>
                </div>
                
                <div class="control-panel">
                    <button class="control-btn" onclick="playSound()">🔊 CRY</button>
                    <button class="control-btn" onclick="toggleShiny()">✨ SHINY</button>
                </div>
            </div>
            
            <!-- Navigation -->
            <div class="nav-buttons">
                <button class="nav-btn" onclick="previousDoge()">◀</button>
                <button class="nav-btn" onclick="nextDoge()">▶</button>
            </div>
            
        `;
        
        pokedexComplete.innerHTML = pokedexHTML;
        
        // Réattacher les event listeners
        window.nextDoge = () => {
            currentDoge = (currentDoge + 1) % dogemons.length;
            updateDisplay();
            flashLight('green');
        };
        
        window.previousDoge = () => {
            currentDoge = (currentDoge - 1 + dogemons.length) % dogemons.length;
            updateDisplay();
            flashLight('red');
        };
        
        window.changeDoge = (id) => {
            const index = dogemons.findIndex(d => d.id === id);
            if (index !== -1) {
                currentDoge = index;
                updateDisplay();
                flashLight('yellow');
            }
        };
        
        window.toggleShiny = () => {
            isShiny = !isShiny;
            updateDisplay();
            flashLight('yellow');
        };
        
        window.playSound = () => {
            const sprite = document.getElementById('dogeSprite');
            if (sprite) {
                sprite.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    sprite.style.transform = 'scale(1)';
                }, 200);
                
                // Show "WOW!" text
                const wow = document.createElement('div');
                wow.textContent = 'WOW!';
                wow.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 2em;
                    color: #ffeb3b;
                    font-weight: bold;
                    animation: fadeOut 1s ease-out;
                    pointer-events: none;
                    text-shadow: 2px 2px 0 #000;
                    z-index: 1000;
                `;
                document.querySelector('.doge-display').appendChild(wow);
                setTimeout(() => wow.remove(), 1000);
            }
            flashLight('red');
        };
        
        window.showInfo = () => {
            const doge = dogemons[currentDoge];
            alert(`
                ${doge.name} - Dogemon #${doge.id}
                
                Type: ${doge.types.join(' / ').toUpperCase()}
                
                Stats Total: ${Object.values(doge.stats).reduce((a, b) => a + b, 0)}
                
                Rarity: LEGENDARY
                
                Elon's Favorite: YES
                
                Contract: coming soon
                
                X: @DogemonOnSol
            `);
        };
        
        window.copyContract = () => {
            navigator.clipboard.writeText('coming soon');
            
            // Afficher un message de confirmation
            const copyMsg = document.createElement('div');
            copyMsg.textContent = 'Contract Copied!';
            copyMsg.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #00ff88;
                color: #000;
                padding: 10px 20px;
                border-radius: 5px;
                font-weight: bold;
                animation: fadeOut 2s ease-out;
                pointer-events: none;
                z-index: 1000;
            `;
            document.querySelector('.evolution-panel').appendChild(copyMsg);
            setTimeout(() => copyMsg.remove(), 2000);
        };
        
        function flashLight(color) {
            const light = document.querySelector(`.small-light.${color}`);
            if (light) {
                light.style.animation = 'none';
                setTimeout(() => {
                    light.style.animation = `blink 0.5s`;
                }, 10);
            }
        }
    }
    
    // Initialiser le Pokédex
    updateDisplay();
    
    // Pas de navigation automatique car il n'y a qu'un seul DOGEMON
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') window.nextDoge();
        if (e.key === 'ArrowLeft') window.previousDoge();
        if (e.key === ' ') { e.preventDefault(); window.playSound(); }
        if (e.key === 's') window.toggleShiny();
    });
}

function showPokemonDetails(dogemon) {
    const content = document.getElementById('pokedexContent');
    if (!content) return;
    
    // Sample Pokemon data with additional details
    const pokemonDetails = {
        1: { height: "0.7 m", weight: "6.9 kg", species: "Seed Dog", habitat: "Grassland", contract: "0x1a2b...c3d4" },
        2: { height: "1.0 m", weight: "13.0 kg", species: "Seed Dog", habitat: "Grassland", contract: "0x2b3c...d4e5" },
        3: { height: "2.0 m", weight: "100.0 kg", species: "Seed Dog", habitat: "Grassland", contract: "0x3c4d...e5f6" },
        4: { height: "0.9 m", weight: "8.5 kg", species: "Flower Dog", habitat: "Gardens", contract: "0x4d5e...f6g7" },
        5: { height: "1.1 m", weight: "15.2 kg", species: "Thorn Dog", habitat: "Dark Forest", contract: "0x5e6f...g7h8" },
        6: { height: "0.8 m", weight: "7.3 kg", species: "Petal Dog", habitat: "Rose Gardens", contract: "0x6f7g...h8i9" },
        7: { height: "1.3 m", weight: "22.1 kg", species: "Bloom Dog", habitat: "Mystical Gardens", contract: "0x7g8h...i9j0" },
        8: { height: "1.2 m", weight: "18.7 kg", species: "Vine Dog", habitat: "Dense Forest", contract: "0x8h9i...j0k1" },
        9: { height: "0.5 m", weight: "3.2 kg", species: "Seed Dog", habitat: "Fields", contract: "0x9i0j...k1l2" }
    };
    
    const details = pokemonDetails[dogemon.id] || { 
        height: "Unknown", weight: "Unknown", species: "Mystery Dog", 
        habitat: "Unknown", contract: "0x0000...0000" 
    };
    
    const descriptions = {
        1: "A loyal companion that carries a flower bud on its back. The bud releases a pleasant scent that attracts other Dogemon.",
        2: "The flower bud on its back has grown larger and more vibrant. It can now release spores that have healing properties.",
        3: "The ultimate evolution, with a magnificent flower that can absorb sunlight to increase its power. Very loyal and protective.",
        4: "A fairy-type variant with beautiful sunflower petals. Known for its cheerful disposition and healing abilities.",
        5: "A darker variant with sharp thorns. Despite its intimidating appearance, it's very protective of its trainer.",
        6: "Elegant and graceful, this Dogemon's rose petals can create soothing aromatherapy effects.",
        7: "A psychic-type that can communicate telepathically through its colorful blooms.",
        8: "Strong and athletic, it uses vine whips in battle while maintaining its friendly dog nature.",
        9: "The youngest form, full of potential. Small seed on its back will eventually bloom into something beautiful."
    };
    
    content.innerHTML = `
        <div class="pokemon-details">
            <div class="pokemon-sprite">${dogemon.emoji}</div>
            <div class="pokemon-info">
                <div class="pokemon-name-detail">${dogemon.name}</div>
                <div class="pokemon-number">#${String(dogemon.id).padStart(3, '0')}</div>
                <div class="pokemon-types-detail">
                    ${dogemon.type.map(type => `<span class="pokemon-type type-${type}">${type.toUpperCase()}</span>`).join('')}
                </div>
            </div>
            
            <div class="pokemon-stats">
                <h4 style="margin-bottom: 1rem; color: #2e7d32;">Base Stats</h4>
                <div class="stat-row">
                    <span class="stat-name">HP</span>
                    <span class="stat-value">${dogemon.hp}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-name">Attack</span>
                    <span class="stat-value">${dogemon.attack}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-name">Defense</span>
                    <span class="stat-value">${dogemon.defense}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-name">Total</span>
                    <span class="stat-value">${dogemon.hp + dogemon.attack + dogemon.defense}</span>
                </div>
            </div>
            
            <div class="pokemon-description">
                <h4 style="margin-bottom: 1rem; color: #2e7d32;">Description</h4>
                <p>${descriptions[dogemon.id] || "A mysterious Dogemon with unknown abilities."}</p>
            </div>
            
            <div class="pokemon-extra-info">
                <h4 style="margin-bottom: 1rem; color: #2e7d32;">Details</h4>
                <div class="extra-info-row">
                    <span class="extra-info-label">Species</span>
                    <span class="extra-info-value">${details.species}</span>
                </div>
                <div class="extra-info-row">
                    <span class="extra-info-label">Height</span>
                    <span class="extra-info-value">${details.height}</span>
                </div>
                <div class="extra-info-row">
                    <span class="extra-info-label">Weight</span>
                    <span class="extra-info-value">${details.weight}</span>
                </div>
                <div class="extra-info-row">
                    <span class="extra-info-label">Habitat</span>
                    <span class="extra-info-value">${details.habitat}</span>
                </div>
                <div class="extra-info-row">
                    <span class="extra-info-label">Contract</span>
                    <span class="extra-info-value" style="font-family: monospace; font-size: 0.9rem;">${details.contract}</span>
                </div>
            </div>
        </div>
    `;
}

function closePokedex() {
    const content = document.getElementById('pokedexContent');
    if (content) {
        content.innerHTML = `
            <div class="no-selection">
                <p>Select a Dogemon to view its details</p>
            </div>
        `;
    }
}
/**
 * スキンの定義（見た目のみ異なる）
 */
export const SKINS = {
    striker: {
        id: 'striker',
        name: 'STRIKER',
        description: 'シアンに輝く標準カラー。宇宙の闇に映えるクールな機体。',
        image: 'assets/images/player.png',
        color: '#00ffff',
        glowColor: 'rgba(0, 255, 255, 0.4)',
        engineColor: '#00ffff',
    },
    phantom: {
        id: 'phantom',
        name: 'PHANTOM',
        description: 'エメラルドグリーンの光を纏うステルス塗装。闇に溶け込む幽霊機。',
        // ファントムの画像を新しいもの（2.png）に変えるよ！
        image: 'assets/images/2.png',
        color: '#00ff88',
        glowColor: 'rgba(0, 255, 136, 0.4)',
        engineColor: '#00ff88',
    },
    inferno: {
        id: 'inferno',
        name: 'INFERNO',
        description: '灼熱のオレンジに染まる炎の塗装。戦場を焦がす業火の翼。',
        // インフェルノの画像を新しいもの（3.png）に変えるよ！
        image: 'assets/images/3.png',
        color: '#ff6600',
        glowColor: 'rgba(255, 102, 0, 0.4)',
        engineColor: '#ff6600',
    },
    nova: {
        id: 'nova',
        name: 'NOVA',
        description: '超新星の輝きを宿す純白の機体。眩い光で敵を圧倒する。',
        // ノヴァの画像を新しいもの（4.png）に変えるよ！
        image: 'assets/images/4.png',
        color: '#ffffff',
        glowColor: 'rgba(255, 255, 255, 0.3)',
        engineColor: '#aaccff',
    },
    viper: {
        id: 'viper',
        name: 'VIPER',
        description: '毒蛇の如き鮮烈なライムグリーン。見た者に恐怖を刻む。',
        // ヴァイパーの画像を新しいもの（5.png）に変えるよ！
        image: 'assets/images/5.png',
        color: '#aaff00',
        glowColor: 'rgba(170, 255, 0, 0.4)',
        engineColor: '#aaff00',
    },
    sakura: {
        id: 'sakura',
        name: 'SAKURA',
        description: '桜色に輝く和風カラー。儚くも美しい花びらの残像を残す。',
        image: 'assets/images/sakura.png',
        color: '#ff77aa',
        glowColor: 'rgba(255, 119, 170, 0.4)',
        engineColor: '#ff99cc',
    },
    thunder: {
        id: 'thunder',
        name: 'THUNDER',
        description: '稲妻を纏う電撃カラー。紫電一閃、瞬く間に敵を貫く。',
        image: 'assets/images/thunder.png',
        color: '#aa66ff',
        glowColor: 'rgba(170, 102, 255, 0.4)',
        engineColor: '#bb88ff',
    },
    crimson: {
        id: 'crimson',
        name: 'CRIMSON',
        description: '深紅に燃える戦闘機。血のように赤い軌跡が闘志を示す。',
        image: 'assets/images/crimson.png',
        color: '#ff2244',
        glowColor: 'rgba(255, 34, 68, 0.4)',
        engineColor: '#ff4466',
    },
    glacier: {
        id: 'glacier',
        name: 'GLACIER',
        description: '氷河のような冷たい青白さ。凍てつく冷気が周囲を包む。',
        image: 'assets/images/glacier.png',
        color: '#44aaff',
        glowColor: 'rgba(68, 170, 255, 0.4)',
        engineColor: '#66bbff',
    },
    gold: {
        id: 'gold',
        name: 'GOLD',
        description: '黄金に輝く伝説の塗装。歴戦のエースだけが許される至高の証。',
        image: 'assets/images/gold.png',
        color: '#ffd700',
        glowColor: 'rgba(255, 215, 0, 0.4)',
        engineColor: '#ffcc00',
    }
};

/** スキンIDの配列（順番を保持するため） */
export const SKIN_ORDER = [
    'striker', 'phantom', 'inferno', 'nova', 'viper',
    'sakura', 'thunder', 'crimson', 'glacier', 'gold'
];

/** デフォルトのスキン */
export const DEFAULT_SKIN = 'striker';

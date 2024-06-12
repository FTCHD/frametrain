import type { Page } from "../utils"

export default function PageView({
    page,
    currentPage,
    slideCount
}: { page: Page, currentPage: number, slideCount: number}) {
    return (
        <div
            style={{
                display: 'flex',
                flexFlow: 'column nowrap',
                alignItems: 'stretch',
                width: '100%',
                height: '100%',
                backgroundColor: '#fff',
                color: '#000',
            }}
        >
            <div style={{
                display: 'flex',
                flexFlow: 'column nowrap',
                padding: '36px',
                fontFamily: 'Georgia',
                fontSize: '18px',
             }}>
                {page.map((element, index) => {
                    switch (element.tag) {
                        case 'IMG':
                            return <img key={index} src={element.src} alt="frame" style={{ margin: '8px 0' }} />
                        case 'P':
                            return <p key={index} style={{ margin: '8px 0' }}>{element.text}</p>
                        case 'H1':
                            return <h1 key={index} style={{ fontSize: '24px', margin: '8px 0' }}>{element.text}</h1>
                        case 'H2':
                            return <h2 key={index} style={{ fontSize: '18px', margin: '8px 0' }}>{element.text}</h2>
                        case 'H3':
                            return <h3 key={index} style={{ margin: '8px 0' }}>{element.text}</h3>
                        case 'H4':
                            return <h4 key={index} style={{ margin: '8px 0' }}>{element.text}</h4>
                        case 'H5':
                            return <h5 key={index} style={{ margin: '8px 0' }}>{element.text}</h5>
                        case 'H6':
                            return <h6 key={index} style={{ margin: '8px 0' }}>{element.text}</h6>
                        case 'STRONG':
                            return <strong key={index} style={{ margin: '8px 0' }}>{element.text}</strong>
                        case 'EM':
                            return <em key={index} style={{ margin: '8px 0' }}>{element.text}</em>
                        default:
                            return <span key={index} style={{ margin: '8px 0' }}>{element.text}</span>
                    }
                })}
            </div>
            <div style={{
                display: 'flex',
                flexFlow: 'column nowrap',
                padding: '36px',
                fontFamily: 'Georgia',
                fontSize: '12px',
                position: 'absolute',
                top: '-18px',
                right: '0'
             }}>
                { currentPage }/{ slideCount }
             </div>
        </div>
    )
}

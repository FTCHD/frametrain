import type { Config } from '..'

export default function CoverView(config: Config) {
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundColor: 'white',
                padding: '50px',
            }}
        >
            <span
                style={{
                    width: '100%',
                    height: '80%',
                    fontFamily: 'Roboto',
                    color: 'black',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    fontSize: '100px',
                    overflow: 'hidden',
                    fontWeight: '300',
                    paddingRight: '15px',
                }}
            >
                {config.full_name}
                <span style={{fontSize: '30px'}}>
                    {config.description}
                </span>
            </span>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '20px',
                    fontWeight: 600,
                    gap: '10px',
                }}
            >
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    {
                        config.owner_avatar_url &&
                        <img
                            style={{
                                border: '7px solid rgba(52, 52, 52, 0.2)',
                                borderRadius: '50%',
                            }}
                            src={config.owner_avatar_url}
                            width="128px"
                            height="128px"
                            alt="Github Repository"
                        />
                    }
                </div>
                <p style={{fontSize: '50px', display:"flex", gap:"10px"}}>
                    <svg aria-hidden="true" height="50" width="50" style={{color:"white"}}>
                        <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z"></path>
                    </svg>
                    {
                        config.stargazers_count ? config.stargazers_count : 0
                    }
                </p>
                <p style={{fontSize: '50px', display:"flex", gap:"10px"}}>
                    <svg aria-hidden="true" height="50" width="50">
                        <path d="M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 0 1 0-1.798c.45-.677 1.367-1.931 2.637-3.022C4.33 2.992 6.019 2 8 2ZM1.679 7.932a.12.12 0 0 0 0 .136c.411.622 1.241 1.75 2.366 2.717C5.176 11.758 6.527 12.5 8 12.5c1.473 0 2.825-.742 3.955-1.715 1.124-.967 1.954-2.096 2.366-2.717a.12.12 0 0 0 0-.136c-.412-.621-1.242-1.75-2.366-2.717C10.824 4.242 9.473 3.5 8 3.5c-1.473 0-2.825.742-3.955 1.715-1.124.967-1.954 2.096-2.366 2.717ZM8 10a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 10Z"></path>
                    </svg>
                    {
                        config.watchers_count ? config.watchers_count : 0
                    }
                </p>
                <p style={{fontSize: '50px', display:"flex", gap:"10px"}}>
                    <svg aria-hidden="true" height="50" width="50">
                        <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path>
                    </svg>
                    {
                        config.forks_count ? config.forks_count : 0
                    }
                </p>
            </div>
        </div>
    )
}

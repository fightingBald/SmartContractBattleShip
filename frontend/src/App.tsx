import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styles from './styles.module.css'
import * as ethereum from '@/lib/ethereum'
import * as main from '@/lib/main'
import { BigNumber } from 'ethers'
import { Rings } from 'react-loader-spinner'

type Canceler = () => void
const useAffect = (
  asyncEffect: () => Promise<Canceler | void>,
  dependencies: any[] = []
) => {
  const cancelerRef = useRef<Canceler | void>()
  useEffect(() => {
    asyncEffect()
      .then(canceler => (cancelerRef.current = canceler))
      .catch(error => console.warn('Uncatched error', error))
    return () => {
      if (cancelerRef.current) {
        cancelerRef.current()
        cancelerRef.current = undefined
      }
    }
  }, dependencies)
}

const useWindowSize = () => {
  const [size, setSize] = useState({ height: 0, width: 0 })
  const compute = useCallback(() => {
    const height = Math.min(window.innerHeight, 800)
    const width = Math.min(window.innerWidth, 800)
    if (height < width) setSize({ height, width: height })
    else setSize({ height: width, width })
  }, [])
  useEffect(() => {
    compute()
    window.addEventListener('resize', compute)
    return () => window.addEventListener('resize', compute)
  }, [compute])
  return size
}

// const useWallet = () => {
//   const [details, setDetails] = useState<ethereum.Details>()
//   const [contract, setContract] = useState<main.Main>()
//   useAffect(async () => {
//     const details_ = await ethereum.connect('metamask')
//     if (!details_) return
//     setDetails(details_)
//     const contract_ = await main.init(details_)
//     if (!contract_) return
//     setContract(contract_)
//   }, [])
//   return useMemo(() => {
//     if (!details || !contract) return
//     return { details, contract }
//   }, [details, contract])
// }
const useWallet = () => {
  const [details, setDetails] = useState<ethereum.Details>()
  const [contract, setContract] = useState<main.Main>()
  // const [ship, setShip] = useState<main.MyShip>()
  const [ship1, setShip1] = useState<main.MyShip>()
  const [ship2, setShip2] = useState<main.MyShip>()
  const [ship3, setShip3] = useState<main.MyShip>()
  const [ship4, setShip4] = useState<main.MyShip>()

  useAffect(async () => {
    const details_ = await ethereum.connect('metamask')
    if (!details_) return
    setDetails(details_)
    const contract_ = await main.init(details_)
    const ship_1 = await main.shipsArray(1, details_)
    const ship_2 = await main.shipsArray(2, details_)
    const ship_3 = await main.shipsArray(3, details_)
    const ship_4 = await main.shipsArray(4, details_)

    // const ship_ = await main.ship(details_)
    if (!contract_) return
    // if (!ship_) return
    if (!ship_1) return
    if (!ship_2) return
    if (!ship_3) return
    if (!ship_4) return

    setContract(contract_)
    // setShip(ship_);
    setShip1(ship_1)
    setShip2(ship_2)
    setShip3(ship_3)
    setShip4(ship_4)
  }, [])
  // return useMemo(() => {
  //   if (!details || !contract || !ship) return
  //   return { details, contract, ship}
  // }, [details, contract, ship])
  return useMemo(() => {
    if (!details || !contract || !ship1 || !ship2) return
    return { details, contract, ship1, ship2, ship3, ship4}
  }, [details, contract, ship1, ship2, ship3, ship4])
}

type Ship = {}
const useBoard = (wallet: ReturnType<typeof useWallet>) => {
  const [board, setBoard] = useState<(null | Ship)[][]>([])
  useAffect(async () => {
    if (!wallet) return
    const onRegistered = (
      id: BigNumber,
      owner: string,
      x: BigNumber,
      y: BigNumber
    ) => {
      console.log('onRegistered')
      setBoard(board => {
        return board.map((x_, index) => {
          if (index !== x.toNumber()) return x_
          return x_.map((y_, indey) => {
            if (indey !== y.toNumber()) return y_
            return { owner, index: id.toNumber() }
          })
        })
      })
    }
    const onTouched = (id: BigNumber, x_: BigNumber, y_: BigNumber) => {
      console.log('onTouched')
      const x = x_.toNumber()
      const y = y_.toNumber()
      setBoard(board => {
        return board.map((x_, index) => {
          if (index !== x) return x_
          return x_.map((y_, indey) => {
            if (indey !== y) return y_
            return null
          })
        })
      })
    }
    const updateSize = async () => {
      const [event] = await wallet.contract.queryFilter('Size', 0)
      const width = event.args.width.toNumber()
      const height = event.args.height.toNumber()
      const content = new Array(width).fill(0)
      const final = content.map(() => new Array(height).fill(null))
      setBoard(final)
    }
    const updateRegistered = async () => {
      const registeredEvent = await wallet.contract.queryFilter('Registered', 0)
      registeredEvent.forEach(event => {
        const { index, owner, x, y } = event.args
        onRegistered(index, owner, x, y)
      })
    }
    const updateTouched = async () => {
      const touchedEvent = await wallet.contract.queryFilter('Touched', 0)
      touchedEvent.forEach(event => {
        const { ship, x, y } = event.args
        onTouched(ship, x, y)
      })
    }
    await updateSize()
    await updateRegistered()
    await updateTouched()
    console.log('Registering')
    wallet.contract.on('Registered', onRegistered)
    wallet.contract.on('Touched', onTouched)
    return () => {
      console.log('Unregistering')
      wallet.contract.off('Registered', onRegistered)
      wallet.contract.off('Touched', onTouched)
    }
  }, [wallet])
  return board
}

const shipsArray : Array<string> = main.myShip();

let i = 1;
const Buttons = ({ wallet, num, setter}: { wallet: ReturnType<typeof useWallet>, num: number, setter : Function}) => {
  const next = () => wallet?.contract.turn()
  const registerNewShip = () => {
    // wallet?.contract.register(main.myShip()[i]);
    // i++;
    // wallet?.contract.register(main.getShip(num))
    if (wallet?.contract.register(main.getShip(num))){
      setter(true);
    };
    // setter(true);
    // setter(false);

  }
  return (//need to add the fuction wallet is the object of the main contracct
    <div style={{ display: 'flex', gap: 5, padding: 5 }}>
      <button onClick={registerNewShip}>Register</button>
      <button onClick={next}>Turn</button>
    </div>
  )
}


const CELLS = new Array(100 * 100)
export const App = () => {

  let playersCount : number = 1;
  // const playerShips : number = 0;
  const [playerShips, setPlayerShips] = useState(0)
  const [shipRegistered, setShipRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cpt, setCpt] = useState(1);
  const [postionMode, setPositionMode] = useState(true);
  const wallet = useWallet()
  const board = useBoard(wallet)
  const size = useWindowSize()
  const st = {
    ...size,
    gridTemplateRows: `repeat(${board?.length ?? 0}, 1fr)`,
    gridTemplateColumns: `repeat(${board?.[0]?.length ?? 0}, 1fr)`,
  }
  if (shipRegistered){
   setCpt(cpt+1);
   setShipRegistered(!shipRegistered)
  }
  const selectShipPos = async ( x: number , y:number) => {
    setIsLoading(true);
    if(playerShips === 0){
      await wallet?.ship1.setShipPostion(x,y);
    }
    if(playerShips === 1){
      await wallet?.ship2.setShipPostion(x,y);
    }  
    // await wallet?.ship.setShipPostion(x,y);
    // setPlayerShips(playerShips+1);
    setPositionMode(!postionMode);
    setIsLoading(false);
    alert('Select fire position')
  }

  const selectTargetPos = async ( x: number , y:number) => {
    setIsLoading(true);
    if (playersCount ===2){
      if(playerShips === 0){
        await wallet?.ship3.setTargetPostion(x,y);
      }
      if(playerShips === 1){
        await wallet?.ship4.setTargetPostion(x,y);
      } 
    } else {
      if(playerShips === 0){
        await wallet?.ship1.setTargetPostion(x,y);
      }
      if(playerShips === 1){
        await wallet?.ship2.setTargetPostion(x,y);
      } 
    }
    
    
    // await wallet?.ship.setTargetPostion(x,y);
    setPositionMode(!postionMode)
    setPlayerShips(playerShips+1)
    setIsLoading(false);

  }

  console.log(cpt)
  if ( cpt === 3){
    setIsLoading(true)
    console.log('Player 2 turn')
    setPlayerShips(0);
    playersCount = playersCount + 1
    alert("Player 2 turn !\n Connect your wallet !")
    // window.location.reload()
  }

  
  return (
    <React.Fragment>  
    <div className={styles.body}>
      <h1>Welcome to Touché Coulé</h1>
      {isLoading ? 
        <Rings
          height="200"
          width="200"
          radius="9"
          color="red"
          ariaLabel="loading"
          wrapperStyle
          wrapperClass 
        />  : 
        <div className={styles.grid} style={st}>
        {CELLS.fill(0).map((_, index) => {
          const x = Math.floor(index % board?.length ?? 0)
          const y = Math.floor(index / board?.[0]?.length ?? 0)
          const background = board?.[x]?.[y] ? 'red' : 'grey'
          return (
            <div key={index} className={styles.cell} style={{ background }} onClick={() => postionMode ? selectShipPos(x,y) : selectTargetPos(x,y)} />
          )
        })
      }
      </div>
      }
      <Buttons wallet={wallet} num={cpt} setter={setShipRegistered}/> 
    </div>
    </React.Fragment>
  )
}

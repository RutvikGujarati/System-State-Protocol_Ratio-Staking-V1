import React, { useContext, useEffect, useState } from "react";
import "./MixedIptAndRpt.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faListCheck } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { themeContext } from "../../App";
import "../../Utils/Theme.css";
import { Web3WalletContext } from "../../Utils/MetamskConnect";
import { functionsContext } from "../../Utils/Functions";
import {  ethers } from "ethers";

export default function IncrementPriceTarget() {
  const { theme } = useContext(themeContext);
  const shadow = theme === "lightTheme" && "lightSh" || theme === "dimTheme" && 'dimSh' || theme === "darkTheme" && "darkSh"
  const { accountAddress, currencyName, userConnected } = useContext(Web3WalletContext)
  const { socket, getPrice, getRatioPriceTargets, getIncrementPriceTargets, getDepositors, getStateTokenHolders, getStateTokenTargets } = useContext(functionsContext)
  const [price, setPrice] = useState('0')
  const [escrowVaultTargets, setEscrowVaultTargets] = useState([])
  const [seeFullPage, setseeFullPage] = useState(false)
  const [nextPage, setNextPage] = useState(0)
  const [noOfPage, setNoOfPage] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)


  const formatTimeDifference = async (seconds) => {
    if (seconds >= 60 * 60 * 24) {
      const days = Math.floor(seconds / (24 * 60 * 60));
      return `${days} day${days > 1 ? 's' : ''}`;
    } else if (seconds >= 60 * 60) {
      const hours = Math.floor(seconds / (60 * 60));
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }

  }
  const IncrementPriceTarget = async () => {
    if (accountAddress && currencyName) {
       try {
         let price = await getPrice();
         let formattedPrice = await ethers.utils.formatEther(price || '0');
         setPrice(formattedPrice);
   
         let All_USERS_TARGETS = [];
   
         let allDepositorsAddress = await getDepositors();
         
         for (let index = 0; index < allDepositorsAddress.length; index++) {
           const address = allDepositorsAddress[index];
           let incrementPriceTarget = await getIncrementPriceTargets(address);
           All_USERS_TARGETS.push(...incrementPriceTarget || []);
         }
   
         // Calculate total pages
         const itemsPerPage = 25;
         const totalPages = Math.ceil(All_USERS_TARGETS.length / itemsPerPage);
         setNoOfPage(totalPages); // Update the total number of pages
   
         // Sort the targets
         const sortedArray = [...All_USERS_TARGETS || []].sort((a, b) => {
           const formattedRatioTargetA = ethers.utils.formatEther(a?.priceTarget.toString());
           const formattedRatioTargetB = ethers.utils.formatEther(b?.priceTarget.toString());
   
           const numericValueA = Number(formattedRatioTargetA);
           const numericValueB = Number(formattedRatioTargetB);
   
           return numericValueA - numericValueB;
         });
   
         // Process and display targets for the current page
         const startIndex = (currentPage - 1) * itemsPerPage;
         const endIndex = startIndex + itemsPerPage;
         const itemsForCurrentPage = sortedArray.slice(startIndex, endIndex);
   
         try {
           let items = await Promise.all(itemsForCurrentPage.map((target, index) => processTargets(target, index, currencyName)));
           setEscrowVaultTargets(items.filter(Boolean));
         } catch (error) {
           console.error('Error processing targets:', error);
         }
   
       } catch (error) {
         console.error('error:', error);
       }
    }
   }

  const processTargets = async (target, index, currencyName) => {
    if (index >= (0 + nextPage) && index <= (25 + nextPage)) {
      try {
        const formattedPriceTarget = ethers.utils.formatEther(target?.ratioPriceTarget.toString())
        const formattedTargetAmount = ethers.utils.formatEther(target?.TargetAmount.toString())

        const PriceTarget = Number(formattedPriceTarget).toFixed(6);
        const targetAmount = Number(formattedTargetAmount).toFixed(6) + ' ' + await currencyName;
        const givenTimestamp = target?.Time.toString()
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const timeDifferenceInSeconds = currentTimestamp - Number(givenTimestamp);
        const timeDifference = await formatTimeDifference(Number(timeDifferenceInSeconds));

        if (!target.isClosed) return (
          <div key={index} className={`box-items ${(theme === "darkTheme" && "Theme-box-item") || (theme === "dimTheme" && "dim-theme-items" && "dim-theme-items-border") || "viewItemsTop"} `}>
            <div className="box-1" id="box1">
              <div> <p> <span>Transaction</span> </p>
                <p className={`  ${(theme === "darkTheme" && "Theme-block-time") || (theme === "dimTheme" && "Theme-block-time") || "time-opacity "} `} >
                  {timeDifference ?? timeDifference} ago
                </p>
              </div>
            </div>
            <div className="box-1 box-2" id="box2">
              <p className={`${(theme === "darkTheme" && "Theme-col2-para") || (theme === "dimTheme" && "Theme-col2-para")}`} > Target Price<span> $ {PriceTarget ?? PriceTarget}</span> </p>
              <p className={`${(theme === "darkTheme" && "Theme-col2-para") || (theme === "dimTheme" && "text-white")}`} ></p>
            </div>
            <p className={`box-3 px-2  ${(theme === "darkTheme" && "Theme-btn-block") || (theme === "dimTheme" && "dimThemeBtnBg")}  `} > {targetAmount ?? targetAmount}</p>
          </div>
        )

      } catch (error) {
        console.log('errorx:', error)
      }
    }
  }
  useEffect(() => {
    if (userConnected) {

      IncrementPriceTarget()
    }
  }, [accountAddress, currencyName, theme, socket])

console.log('escorwvalult : ', escrowVaultTargets);
  return (
    <>
      <div className={`mainMixContainer p-2 container-fluid ${theme == 'dimTheme' && 'dimTheme-index-class'}`}>
        <div className={`container-1 padding_top pt-3 ${shadow}  ${(theme === "darkTheme" && "Theme-block-container") || (theme === "dimTheme" && "dimThemeBg")}`}>
          <div className={`box-titles1 mx-3 ${theme === "darkTheme" && ""} `} id={``} >
            {/* <h1 className={`box-titles fontsCustom ${(theme === "darkTheme" && "bg-dark" && "text-white") || (theme === "dimTheme" && "title-color")}`} >
            Ratio Price Targets (rPT)
            </h1> */}
            <h1 className={`box-title mb-3 ${(theme === "darkTheme" && "bg-dark" && "text-white") || (theme === "dimTheme" && "title-color")}`}>
              Ratio Price Targets (rPT)
            </h1>
          </div>
          {/* <div className={`box-items_heading px-4 ${(theme === "darkTheme" && "Theme-box-item") || (theme === "dimTheme" && "dim-theme-items" && "dim-theme-items-border") || "viewItemsTop"} `}>
            <p className={`ms-2 mb-0 alignSizeHead ${(theme === "darkTheme" && "Theme-col2-para") || (theme === "dimTheme" && "Theme-col2-para")}`} >Date and Time</p>
            <p className={`mb-0 alignSizeHead alignMargin ${(theme === "darkTheme" && "Theme-col2-para") || (theme === "dimTheme" && "Theme-col2-para")}`} > Target Price</p>
            <p className={`mb-0 text-end alignSizeHead ${(theme === "darkTheme" && "Theme-col2-para") || (theme === "dimTheme" && "Theme-col2-para")}`} > Tokens in Vault</p>
          </div> */}
          <div className={`${seeFullPage ? 'seenFullContent' : ''} reponsive-box1`}>
            {escrowVaultTargets}

          </div>
          <div className="view-mains">
            <div className={`view-pageMixTab  ${(theme === "darkTheme" && "Theme-view-page") || (theme === "dimTheme" && "dimThemeBlockView" && "dim-theme-items-border")} `}>
              <div className="makeResponsiveDiv"></div>
              <div className="view-container">
 <Link 
    onClick={()=>setseeFullPage(!seeFullPage)}
    className={`view-link ${(theme === "darkTheme" && "text-white") || (theme === "dimTheme" && "dimThemeBlockView" && "dimThemeBlockView")}`} 
    style={{ textDecoration: 'none', color: 'inherit', marginLeft:"10px"}}>
    VIEW ALL TRANSACTIONS {seeFullPage ?<span> &uarr;</span> : <span> &darr;</span>}
 </Link>
 <div style={{ marginLeft: 'auto' }}></div> {/* Hidden element for alignment */}
</div>
              <div className="table_pageIndex">
        
                <span
                  className="pageBtnDir"
                  onClick={() => {
                    if (currentPage > 1 && currentPage <= noOfPage) {
                      setNextPage(nextPage - 25)
                      setCurrentPage(currentPage - 1)
                    }

                  }}>&#10216;</span>
                <span>{currentPage} {" "}/ {" "}{noOfPage}</span>
                <span
                  className="pageBtnDir"
                  onClick={() => {
                    if (currentPage < noOfPage) {
                      setNextPage(nextPage + 25)
                      setCurrentPage(currentPage + 1)
                    }
                  }}>{" "}&#12297;</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}